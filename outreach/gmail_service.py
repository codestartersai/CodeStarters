"""Gmail OAuth2 + send-with-attachment helpers for Codestarters outreach."""

from __future__ import annotations

import base64
import mimetypes
import os
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

load_dotenv(Path(__file__).resolve().parent / ".env")

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
OUTREACH_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = OUTREACH_DIR / "credentials.json"
TOKEN_FILE = OUTREACH_DIR / "token.json"
DEFAULT_PROSPECTUS = OUTREACH_DIR / "prospectus.pdf"


def _gmail_service():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                raise RuntimeError(
                    "credentials.json is missing. Download OAuth client credentials into outreach/."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def _default_sender() -> str:
    return os.getenv("GMAIL_USER", "outreach@codestarters.xyz").strip()


def _parse_subject_body(draft: str) -> tuple[str, str]:
    text = draft.strip()
    if text.lower().startswith("subject:"):
        first, _, rest = text.partition("\n")
        subject = first.split(":", 1)[1].strip() or "Fire Hacks sponsorship"
        body = rest.strip()
        return subject, body
    return "Fire Hacks sponsorship", text


def send_email(
    *,
    to: str,
    draft: str,
    attach_prospectus: bool = True,
    prospectus_path: Path | None = None,
) -> str:
    """Send an outreach email via Gmail, optionally attaching the sponsorship prospectus."""
    subject, body = _parse_subject_body(draft)
    sender = _default_sender()

    message = EmailMessage()
    message["To"] = to.strip()
    message["From"] = sender
    message["Subject"] = subject
    message.set_content(body)

    if attach_prospectus:
        pdf_path = prospectus_path or DEFAULT_PROSPECTUS
        if pdf_path.exists():
            mime_type, _ = mimetypes.guess_type(str(pdf_path))
            maintype, subtype = (mime_type or "application/pdf").split("/", 1)
            message.add_attachment(
                pdf_path.read_bytes(),
                maintype=maintype,
                subtype=subtype,
                filename=pdf_path.name,
            )

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    service = _gmail_service()
    sent = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    return sent.get("id", "")
