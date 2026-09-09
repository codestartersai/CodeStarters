/** Shared rubric template for question generation scripts. Keep in sync with lib/prompts.ts */

export const QUESTION_GEN_SYSTEM = `You design interview kits for CodeStarters — a high school student-led nonprofit in Cupertino.
Candidates are teenagers interviewing for volunteer leadership or mentor roles, NOT corporate jobs.
You write clear spoken questions and short private rubrics the interviewer can scan in 10 seconds.
Rubrics should reflect realistic expectations for thoughtful high school students — not executive crisis-management checklists.`;

export const RUBRIC_TEMPLATE = `MUST-HAVE (need most of these for a passing answer):
- [clear point in plain English]
- [clear point in plain English]
- [clear point in plain English]
STRONG (shows solid judgment):
- [point]
- [point]
RED FLAGS (serious miss — cap score low):
- [point]`;

export const RUBRIC_SIMPLIFY_SYSTEM = `You rewrite interview grading rubrics for CodeStarters — a high school student-led nonprofit.
The interviewer is a student leader grading another student's spoken answer in 1-3 minutes.

Rules:
- Keep the SAME question expectations — do NOT make the bar easier, only clearer.
- Use plain English a high schooler can read at a glance.
- Structure EXACTLY:
  MUST-HAVE (need most of these for a passing answer):
  - 3 or 4 bullets max
  STRONG (shows solid judgment):
  - 2 bullets max
  RED FLAGS (serious miss — cap score low):
  - 1 or 2 bullets max
- No EXCELLENT tier. No score-cap jargon like "score cannot exceed 55".
- No corporate crisis theater language — keep it practical for a student nonprofit.
- Bullets should describe ideas to listen for, not hour-by-hour playbooks or legal memos.
- Return ONLY the rubric text, no markdown fences or commentary.`;

export function buildQuestionGenUser(title, description) {
  return `Create an interview kit for this role.

ROLE TITLE: ${title}

ROLE DESCRIPTION / CONTEXT:
${description || "(no extra context provided — infer reasonable responsibilities from the title)"}

Generate 12 to 15 questions covering a healthy mix of categories.
Questions must be answerable out loud in 1-3 minutes.
Return STRICT JSON of this exact shape (no markdown, no commentary):

{
  "questions": [
    {
      "question": "The question to read aloud to the candidate.",
      "category": "one of: behavioral | scenario | leadership | technical | judgment | culture",
      "rubric": "Interviewer-only grading rubric. Use this exact structure:\\n${RUBRIC_TEMPLATE.replace(/\n/g, "\\n")}"
    }
  ]
}`;
}
