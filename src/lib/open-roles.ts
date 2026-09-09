import {
  Bot,
  CalendarDays,
  Code2,
  Handshake,
  Megaphone,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type RoleAccent = "sky" | "violet" | "emerald" | "amber" | "orange" | "rose";

export type OpenRole = {
  name: string;
  desc: string;
  icon: LucideIcon;
  accent: RoleAccent;
  hours: string;
  expectations: string[];
  returns: string[];
};

export type OpenRoleGroup = {
  category: string;
  description: string;
  roles: OpenRole[];
};

export const OPEN_ROLE_GROUPS: OpenRoleGroup[] = [
  {
    category: "Leadership",
    description: "Own a function, coordinate teammates, and keep CodeStarters moving week to week.",
    roles: [
      {
        name: "Director of Recruitment",
        desc: "Run volunteer recruiting, screen applicants, and help fill open roles across the org.",
        icon: UserPlus,
        accent: "sky",
        hours: "4–6 hrs/week",
        expectations: [
          "Review applications and keep recruiting moving",
          "Screen candidates and help schedule interviews",
          "Stay on open roles until they are filled",
        ],
        returns: [
          "Logged volunteer hours",
          "Experience hiring and talking to people",
          "Leadership experience for college apps",
        ],
      },
      {
        name: "Director of Events",
        desc: "Plan and run CodeStarters events, from class logistics to community gatherings.",
        icon: CalendarDays,
        accent: "emerald",
        hours: "4–6 hrs/week",
        expectations: [
          "Plan logistics for classes, meetups, and event days",
          "Coordinate volunteers, venues, and day-of details",
          "Show up and run the room when an event is live",
        ],
        returns: [
          "Logged volunteer hours, including event days",
          "Event-ops experience you can point to",
          "Proof you can run something in the real world",
        ],
      },
      {
        name: "Director of Marketing and Media",
        desc: "Own brand voice, social channels, and campaigns that reach students, parents, and sponsors.",
        icon: Megaphone,
        accent: "amber",
        hours: "5–7 hrs/week",
        expectations: [
          "Post consistently and own CodeStarters brand voice",
          "Plan campaigns for programs and events",
          "Direct marketing team members week to week",
        ],
        returns: [
          "Logged volunteer hours",
          "A real marketing portfolio",
          "Leadership and content experience for resumes",
        ],
      },
      {
        name: "Director of Outreach, Partnerships, and Fundraising",
        desc: "Own sponsor outreach, partnership follow-ups, and campaigns that fund CodeStarters programs.",
        icon: Handshake,
        accent: "rose",
        hours: "4–6 hrs/week",
        expectations: [
          "Lead outreach to sponsors and partner orgs",
          "Keep a clear tracker of conversations and follow-ups",
          "Direct fundraising team members week to week",
        ],
        returns: [
          "Logged volunteer hours",
          "Experience talking to partners and sponsors",
          "Leadership experience for college apps",
        ],
      },
    ],
  },
  {
    category: "Recruitment",
    description: "Help screen applicants, follow up with candidates, and keep recruiting organized.",
    roles: [
      {
        name: "Recruitment Team Member",
        desc: "Review applications, help schedule interviews, and support the Director of Recruitment until open roles are filled.",
        icon: UserPlus,
        accent: "sky",
        hours: "3–5 hrs/week",
        expectations: [
          "Review applications and keep recruiting moving",
          "Follow up with candidates and help schedule interviews",
          "Work with the Director of Recruitment to fill open roles",
        ],
        returns: [
          "Logged volunteer hours",
          "Experience hiring and talking to people",
          "Recruiting experience for college apps",
        ],
      },
    ],
  },
  {
    category: "Teaching",
    description: "Lead weekly classes, build lesson plans, and help students ship real projects.",
    roles: [
      {
        name: "AI Team Member",
        desc: "Create AI lesson plans, lead class sessions, and help build websites for businesses.",
        icon: Sparkles,
        accent: "sky",
        hours: "3–5 hrs/week",
        expectations: [
          "Prep AI lessons and show up ready to teach",
          "Run hands-on sessions students can actually follow",
          "Help with free business website projects",
        ],
        returns: [
          "Logged volunteer hours",
          "Teaching and curriculum experience",
          "Project work you can put on a resume",
        ],
      },
      {
        name: "Robotics Team Member",
        desc: "Create lesson plans and run robotics classes, teaching students robotics fundamentals, building, and problem-solving.",
        icon: Bot,
        accent: "violet",
        hours: "3–5 hrs/week",
        expectations: [
          "Write robotics lessons before each session",
          "Teach clearly and help beginners stay unstuck",
          "Show up prepared for every class you take on",
        ],
        returns: [
          "Logged volunteer hours",
          "Classroom teaching experience",
          "A concrete mentoring story for applications",
        ],
      },
      {
        name: "Python Team Member",
        desc: "Create Python lesson plans and lead Python classes, teaching kids hands-on programming.",
        icon: Code2,
        accent: "orange",
        hours: "3–5 hrs/week",
        expectations: [
          "Build Python lessons around small apps and exercises",
          "Teach patiently and keep beginners moving",
          "Coordinate with other teaching team members",
        ],
        returns: [
          "Logged volunteer hours",
          "Teaching experience with real students",
          "Lesson-planning experience for college apps",
        ],
      },
    ],
  },
  {
    category: "Marketing and Media",
    description: "Help us reach students, parents, and sponsors across social and community channels.",
    roles: [
      {
        name: "Marketing and Media Team Member",
        desc: "Create posts, promote events and programs, and grow CodeStarters' community presence.",
        icon: Megaphone,
        accent: "amber",
        hours: "3–5 hrs/week",
        expectations: [
          "Make and schedule posts on a regular cadence",
          "Help promote events and programs",
          "Work with the Director of Marketing and Media on campaigns",
        ],
        returns: [
          "Logged volunteer hours",
          "Content you can show on a resume",
          "Real social and brand experience",
        ],
      },
    ],
  },
  {
    category: "Fundraising",
    description: "Support sponsor outreach, partnership follow-ups, and fundraising campaigns.",
    roles: [
      {
        name: "Fundraising Partnerships and Outreach Team Member",
        desc: "Help with sponsor outreach, partnership follow-ups, and campaigns that fund CodeStarters programs.",
        icon: Handshake,
        accent: "rose",
        hours: "3–5 hrs/week",
        expectations: [
          "Help with outreach emails and follow-ups",
          "Keep a clear tracker of who we have talked to",
          "Support fundraising campaigns when they go live",
        ],
        returns: [
          "Logged volunteer hours",
          "Experience talking to partners",
          "Communication skills for applications",
        ],
      },
    ],
  },
];

export function getOpenRole(name: string): OpenRole | undefined {
  return OPEN_ROLE_GROUPS.flatMap((group) => group.roles).find((role) => role.name === name);
}

/** Query-param slugs for volunteer signup QRs (`?volunteer=leadership`). */
export const VOLUNTEER_GROUP_SLUGS = {
  leadership: "Leadership",
  recruitment: "Recruitment",
  teaching: "Teaching",
  marketing: "Marketing and Media",
  outreach: "Fundraising",
} as const;

export type VolunteerGroupSlug = keyof typeof VOLUNTEER_GROUP_SLUGS;

const VOLUNTEER_GROUP_ALIASES: Record<string, string> = {
  leadership: VOLUNTEER_GROUP_SLUGS.leadership,
  recruitment: VOLUNTEER_GROUP_SLUGS.recruitment,
  recruiting: VOLUNTEER_GROUP_SLUGS.recruitment,
  teaching: VOLUNTEER_GROUP_SLUGS.teaching,
  marketing: VOLUNTEER_GROUP_SLUGS.marketing,
  media: VOLUNTEER_GROUP_SLUGS.marketing,
  outreach: VOLUNTEER_GROUP_SLUGS.outreach,
  fundraising: VOLUNTEER_GROUP_SLUGS.outreach,
};

export function getVolunteerGroupBySlug(slug: string | null | undefined): OpenRoleGroup | undefined {
  if (!slug) return undefined;
  const category = VOLUNTEER_GROUP_ALIASES[slug.trim().toLowerCase()];
  if (!category) return undefined;
  return OPEN_ROLE_GROUPS.find((group) => group.category === category);
}
