export const EXPEDITED_REASON = "Expedited — Club fair signup";

export const HIGH_SCHOOL_GRADES = [
  "9th Grade (Freshman)",
  "10th Grade (Sophomore)",
  "11th Grade (Junior)",
  "12th Grade (Senior)",
] as const;

export function isExpeditedApplication(reason: string | null | undefined): boolean {
  return (reason ?? "").toLowerCase().startsWith("expedited");
}

export function isHighSchoolGrade(grade: string): boolean {
  return (HIGH_SCHOOL_GRADES as readonly string[]).includes(grade);
}
