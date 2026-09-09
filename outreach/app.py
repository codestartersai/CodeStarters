"""Streamlit dashboard: AI-drafted outreach for Codestarters / Firehacks."""

from __future__ import annotations

from pathlib import Path

import streamlit as st

from augment_client import draft_email
from gmail_service import send_email

OUTREACH_DIR = Path(__file__).resolve().parent
PROSPECTUS_PATH = OUTREACH_DIR / "prospectus.pdf"

st.set_page_config(page_title="CodeStarters Outreach", page_icon="📨", layout="centered")
st.title("CodeStarters Outreach")
st.caption("Draft sponsor outreach with Augment, then send from Gmail.")

with st.sidebar:
    st.subheader("Setup")
    st.markdown(
        "- `outreach/.env` with `AUGMENT_API_KEY`\n"
        "- `credentials.json` + OAuth for Gmail send\n"
        "- `prospectus.pdf` for attachments"
    )
    if PROSPECTUS_PATH.exists():
        st.success("Prospectus PDF found.")
    else:
        st.warning("Missing `outreach/prospectus.pdf`.")

company = st.text_input("Company / recipient name")
to_email = st.text_input("Recipient email")
prior_email = st.text_area("Prior email thread (optional)", height=140)
notes = st.text_area(
    "Rough notes",
    height=180,
    placeholder="Why they're a fit, what to ask for, tone, follow-up context...",
)

col_draft, col_send = st.columns(2)

if "draft" not in st.session_state:
    st.session_state.draft = ""

with col_draft:
    if st.button("Draft with Augment", type="primary", use_container_width=True):
        if not company.strip():
            st.error("Add a company / recipient name.")
        else:
            with st.spinner("Drafting..."):
                try:
                    st.session_state.draft = draft_email(
                        company=company,
                        notes=notes,
                        prior_email=prior_email,
                    )
                except Exception as exc:  # noqa: BLE001
                    st.error(str(exc))

with col_send:
    if st.button("Send via Gmail", use_container_width=True):
        if not to_email.strip():
            st.error("Add a recipient email.")
        elif not st.session_state.draft.strip():
            st.error("Draft an email first.")
        else:
            with st.spinner("Sending..."):
                try:
                    message_id = send_email(
                        to=to_email,
                        draft=st.session_state.draft,
                        attach_prospectus=True,
                        prospectus_path=PROSPECTUS_PATH if PROSPECTUS_PATH.exists() else None,
                    )
                    st.success(f"Sent. Gmail message id: {message_id}")
                except Exception as exc:  # noqa: BLE001
                    st.error(str(exc))

draft = st.text_area(
    "Email draft",
    value=st.session_state.draft,
    height=360,
    key="draft_editor",
)

if draft != st.session_state.draft:
    st.session_state.draft = draft
