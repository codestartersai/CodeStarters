export type CodeStartersEvent = {
  slug: string;
  name: string;
  status: "completed";
  when: string;
  length: string;
  eligibility: string;
  desc: string;
  bullets: string[];
  banner?: string;
  theme?: "firehacks" | "rlc";
};

export const EVENTS: CodeStartersEvent[] = [
  {
    slug: "2026-python-bootcamp",
    name: "2026 Python Bootcamp",
    status: "completed",
    when: "Summer 2026",
    length: "1 week",
    eligibility: "All grades",
    desc: "A hands-on Python class for younger students. Students learned the basics by building small apps and working through real exercises, not slides.",
    bullets: [
      "Python syntax, variables, and control flow",
      "Functions, loops, and problem-solving practice",
      "Small apps and exercises students actually ran",
    ],
  },
  {
    slug: "2026-firehacks",
    name: "2026 Fire Hacks",
    status: "completed",
    theme: "firehacks",
    when: "August 9, 2026",
    length: "1 day",
    eligibility: "High school",
    desc: "CodeStarters' one-day high school hackathon at Zoho HQ in Pleasanton. Students shipped software, attended workshops, and competed for prizes.",
    bullets: [
      "150 high school builders",
      "Workshops, meals, and $30K+ in prizes",
      "Hosted at Zoho HQ, Pleasanton",
    ],
  },
  {
    slug: "2026-rlc-hacks",
    name: "RLC Hacks",
    status: "completed",
    theme: "rlc",
    banner: "/events/rlc-hacks-banner.png",
    when: "July 26 – August 4, 2026",
    length: "1 week",
    eligibility: "Students 13+",
    desc: "A global online hackathon hosted by Resera and co-hosted by LovHack and CodeStarters. Students built software that optimizes the technology behind everyday systems.",
    bullets: [
      "Online, open to students worldwide",
      "Co-hosted with Resera and LovHack",
      "300 participants",
    ],
  },
];
