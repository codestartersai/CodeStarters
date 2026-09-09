// Open roles listed on the CodeStarters website (src/routes/index.tsx → openRoles).
// Used to seed the interview-coach role library.

export interface CodestartersRoleSeed {
  title: string;
  category: "Leadership" | "Teaching" | "Marketing" | "Fundraising";
  description: string;
}

const ORG_CONTEXT = `CodeStarters is a student-led nonprofit in Cupertino that teaches Java, Python, and AI to younger students and builds free websites for businesses. Programs include: Java Bootcamp, Python Bootcamp, AI Development & Agent Engineering (OpenClaw + Hermes, agent workflows + OpenCode), Fire Hacks hackathon, and free websites for businesses.`;

export const CODESTARTERS_ROLES: CodestartersRoleSeed[] = [
  {
    title: "Head of Java",
    category: "Leadership",
    description: `${ORG_CONTEXT}

ROLE: Head of Java (Leadership)
RESPONSIBILITIES: Ensures all Java bootcamps have lesson plans ready and helps Java team members prepare for sessions.
EXPECTATIONS: Oversees the Java mentor track; maintains curriculum quality; supports team members before sessions; keeps Java education on schedule.`,
  },
  {
    title: "Recruitment Lead",
    category: "Leadership",
    description: `${ORG_CONTEXT}

ROLE: Recruitment Lead (Leadership)
RESPONSIBILITIES: Runs volunteer recruiting, screens applicants, and helps fill open roles across CodeStarters.
EXPECTATIONS: Reliable follow-through, clear communication with applicants, comfortable coordinating interviews and onboarding, keeps recruiting organized.`,
  },
  {
    title: "Events Lead",
    category: "Leadership",
    description: `${ORG_CONTEXT}

ROLE: Events Lead (Leadership)
RESPONSIBILITIES: Plans and runs CodeStarters events, from bootcamp logistics to community gatherings.
EXPECTATIONS: Strong organization, calm under time pressure, able to coordinate venues, volunteers, and day-of operations.`,
  },
  {
    title: "Marketing and Media Lead",
    category: "Leadership",
    description: `${ORG_CONTEXT}

ROLE: Marketing and Media Lead (Leadership)
RESPONSIBILITIES: Oversees all marketing and social media. The primary person (besides VPs and President) with access to CodeStarters accounts.
EXPECTATIONS: Owns brand voice across platforms, promotes programs and Fire Hacks, coordinates marketing team members, plans campaigns that reach students, parents, and local businesses.`,
  },
  {
    title: "Fundraising Partnerships and Outreach Lead",
    category: "Leadership",
    description: `${ORG_CONTEXT}

ROLE: Fundraising Partnerships and Outreach Lead (Leadership)
RESPONSIBILITIES: Builds sponsor and partner relationships, leads outreach, and helps fund CodeStarters programs.
EXPECTATIONS: Professional communication with sponsors, organized follow-ups, comfortable representing CodeStarters, coordinates fundraising team members.`,
  },
  {
    title: "AI Team Member",
    category: "Teaching",
    description: `${ORG_CONTEXT}

ROLE: AI Team Member
RESPONSIBILITIES: Creates AI lesson plans, leads bootcamp sessions, and helps build websites for businesses.
EXPECTATIONS: Can teach AI literacy, prompting, and agent workflows to students; runs hands-on sessions; collaborates on free business website projects; explains responsible AI use in age-appropriate ways.`,
  },
  {
    title: "Java Team Member",
    category: "Teaching",
    description: `${ORG_CONTEXT}

ROLE: Java Team Member
RESPONSIBILITIES: Creates lesson plans and runs Java bootcamps, teaching students Java fundamentals and problem-solving.
EXPECTATIONS: Patient teaching style; breaks down Java concepts clearly; runs engaging hands-on activities; helps students who may be new to programming feel confident.`,
  },
  {
    title: "Python Team Member",
    category: "Teaching",
    description: `${ORG_CONTEXT}

ROLE: Python Team Member
RESPONSIBILITIES: Creates Python lesson plans and leads Python bootcamps, teaching kids hands-on programming.
EXPECTATIONS: Comfortable teaching Python basics through small apps and exercises; patient with beginners; collaborates with other teaching team members.`,
  },
  {
    title: "Marketing and Media Team Member",
    category: "Marketing",
    description: `${ORG_CONTEXT}

ROLE: Marketing and Media Team Member
RESPONSIBILITIES: Manages social media accounts and posts, draws attention to hackathons, and advertises CodeStarters programs to the community.
EXPECTATIONS: Creates consistent posts, helps promote Fire Hacks and programs, understands CodeStarters mission, works with the Marketing and Media Lead on campaigns, engages students and local community online.`,
  },
  {
    title: "Fundraising Partnerships and Outreach Team Member",
    category: "Fundraising",
    description: `${ORG_CONTEXT}

ROLE: Fundraising Partnerships and Outreach Team Member
RESPONSIBILITIES: Helps with sponsor outreach, partnership follow-ups, and fundraising campaigns.
EXPECTATIONS: Reliable written communication, organized tracking of outreach, works with the Fundraising Partnerships and Outreach Lead, comfortable representing CodeStarters to partners.`,
  },
];
