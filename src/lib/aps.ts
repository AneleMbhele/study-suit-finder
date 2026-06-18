export type SubjectMark = { name: string; percent: number };

/** South African NSC % to APS points conversion (standard scale). */
export function percentToAPS(pct: number): number {
  if (pct >= 80) return 7;
  if (pct >= 70) return 6;
  if (pct >= 60) return 5;
  if (pct >= 50) return 4;
  if (pct >= 40) return 3;
  if (pct >= 30) return 2;
  return 1;
}

/** Sum top-6 subjects, excluding Life Orientation (most SA universities exclude or halve it). */
export function calculateAPS(subjects: SubjectMark[]): number {
  const points = subjects
    .filter((s) => s.name.trim() && !/life\s*orientation/i.test(s.name))
    .map((s) => percentToAPS(Number(s.percent) || 0))
    .sort((a, b) => b - a)
    .slice(0, 6);
  return points.reduce((a, b) => a + b, 0);
}

export type SubjectRequirements = Record<string, number>;

export type QualifyResult = {
  qualifies: boolean;
  reasons: string[];
};

/** Check if a student's subjects meet a course's APS + per-subject requirements. */
export function checkQualification(
  studentAPS: number,
  subjects: SubjectMark[],
  minAPS: number,
  requirements: SubjectRequirements,
): QualifyResult {
  const reasons: string[] = [];
  if (studentAPS < minAPS) {
    reasons.push(`Needs APS of ${minAPS}, you have ${studentAPS}`);
  }
  const subjectPoints = new Map<string, number>();
  for (const s of subjects) {
    if (!s.name.trim()) continue;
    subjectPoints.set(s.name.toLowerCase().trim(), percentToAPS(Number(s.percent) || 0));
  }
  for (const [subject, requiredLevel] of Object.entries(requirements ?? {})) {
    const key = subject.toLowerCase().trim();
    const got = subjectPoints.get(key) ?? 0;
    if (got < requiredLevel) {
      reasons.push(
        got === 0
          ? `Requires ${subject} (level ${requiredLevel}+)`
          : `${subject} needs level ${requiredLevel}, you have ${got}`,
      );
    }
  }
  return { qualifies: reasons.length === 0, reasons };
}

export const COMMON_SA_SUBJECTS = [
  "English",
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "Geography",
  "History",
  "Accounting",
  "Business Studies",
  "Economics",
  "Life Orientation",
  "Afrikaans",
  "isiZulu",
  "isiXhosa",
  "Sesotho",
  "Setswana",
];