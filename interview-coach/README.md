# Interviews

In-person interview tool for CodeStarters hiring. Run it on your laptop during a face-to-face
interview. The interviewee never sees the screen — you read questions aloud, record their answer,
and privately get a transcript plus AI grade.

## Flow

1. **New Interview** — enter their name, pick role(s).
2. **Generate questions** if needed (one click per role).
3. **Interview** — read question → record → grade → next.
4. **Summary** — scores, notes, compare candidates.

## Run locally

```bash
cd interview-coach
cp .env.example .env.local   # OPENAI_API_KEY
npm install
npm run dev
```

Point your laptop mic toward the interviewee. Allow microphone permission when prompted.

Data saves to `data/store.json` (gitignored).
