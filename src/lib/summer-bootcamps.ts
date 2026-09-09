export const SUMMER_BOOTCAMPS = [
  {
    name: "AI Development",
    slug: "ai",
    label: "AI Development & Agent Engineering",
    badge: "Featured Summer Track",
    eligibility: "Open to anyone",
  },
  {
    name: "Robotics",
    slug: "robotics",
    label: "Robotics Bootcamp",
    eligibility: "All grades",
  },
  {
    name: "Python",
    slug: "python",
    eligibility: "All grades",
  },
] as const;

export type SummerBootcampSlug = (typeof SUMMER_BOOTCAMPS)[number]["slug"];

const slugToName = new Map(SUMMER_BOOTCAMPS.map((bootcamp) => [bootcamp.slug, bootcamp.name]));

export function getSummerBootcampBySlug(slug: string) {
  return SUMMER_BOOTCAMPS.find((bootcamp) => bootcamp.slug === slug) ?? null;
}

export function getSummerBootcampName(slug: string): string | null {
  return slugToName.get(slug as SummerBootcampSlug) ?? null;
}

export function getSummerSignupUrl(slug: SummerBootcampSlug, origin = "https://codestarters.org") {
  return `${origin}/summer-signup/${slug}`;
}

export function getAllSummerSignupsUrl(origin = "https://codestarters.org") {
  return `${origin}/summer-signup`;
}
