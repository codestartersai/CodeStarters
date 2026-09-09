"""Augment SDK wrapper for drafting Codestarters outreach emails."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

SYSTEM_PROMPT = """You are a sponsorship and partnerships outreach assistant for CodeStarters.

CodeStarters is a student-led 501(c)(3) nonprofit in Cupertino that teaches CS and AI to younger students and builds free websites for local businesses.

You are currently doing outreach for FIREHACKS, a hackathon CodeStarters is organizing on July 11, 2026 for 200+ Bay Area high schoolers. The event is free, software-only, with $30K+ in prizes.

Turn the user's rough notes (company context, prior thread, what they received) into a polished, professional outreach or follow-up email.

Rules:
- Keep it concise, warm, and credible for a student-led nonprofit.
- Lead with why the company is a fit for Fire Hacks or CodeStarters.
- Mention concrete asks when relevant: API credits, workshop slot, track prize, logo placement, judge seat.
- Include links when useful: firehacks.codestarters.org, codestarters.org, firehacks.xyz.
- Sign off as Smaran, President, CodeStarters, outreach@codestarters.xyz unless the user specifies otherwise.
- Return only the email body. No markdown fences. Include a Subject: line on the first line when drafting a new email.
"""


def _api_key() -> str:
    key = os.getenv("AUGMENT_API_KEY", "").strip()
    if not key:
        raise RuntimeError("AUGMENT_API_KEY is not set. Add it to outreach/.env.")
    return key


def draft_email(*, company: str, notes: str, prior_email: str = "") -> str:
    """Draft a sponsor outreach email from rough notes."""
    from auggie_sdk import Auggie

    prompt_parts = [
        SYSTEM_PROMPT,
        f"Company / recipient: {company.strip() or 'Unknown company'}",
    ]
    if prior_email.strip():
        prompt_parts.append("Prior email thread to respond to:\n" + prior_email.strip())
    prompt_parts.append("Rough notes from the user:\n" + (notes.strip() or "(none)"))
    prompt_parts.append("Write the email now.")

    agent = Auggie(
        api_key=_api_key(),
        model="sonnet4.5",
        allow_indexing=False,
        cli_args=["--quiet", "--max-turns", "4"],
    )
    return agent.run("\n\n".join(prompt_parts), return_type=str).strip()
