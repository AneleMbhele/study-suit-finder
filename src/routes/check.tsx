import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { CourseCard } from "@/components/CourseCard";
import { fetchCourses } from "@/lib/data";
import { calculateAPS, checkQualification, COMMON_SA_SUBJECTS, type SubjectMark } from "@/lib/aps";
import { Trash2, Plus, CheckCircle2, XCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Check my marks — CourseCompass" },
      { name: "description", content: "Enter your South African matric subjects and percentages to see exactly which university courses you qualify for." },
    ],
  }),
  component: Check,
});

const STARTER: SubjectMark[] = [
  { name: "English", percent: 0 },
  { name: "Mathematics", percent: 0 },
  { name: "Physical Sciences", percent: 0 },
  { name: "Life Sciences", percent: 0 },
  { name: "Life Orientation", percent: 0 },
  { name: "", percent: 0 },
  { name: "", percent: 0 },
];

function Check() {
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const [subjects, setSubjects] = useState<SubjectMark[]>(STARTER);
  const [submitted, setSubmitted] = useState(false);

  const aps = useMemo(() => calculateAPS(subjects), [subjects]);

  const results = useMemo(() => {
    if (!submitted || !courses.data) return null;
    const all = courses.data.map((c) => ({
      course: c,
      result: checkQualification(aps, subjects, c.min_aps, c.subject_requirements ?? {}),
    }));
    const qualifying = all.filter((r) => r.result.qualifies);
    const close = all
      .filter((r) => !r.result.qualifies && r.result.reasons.length <= 1)
      .slice(0, 6);
    return { qualifying, close, total: all.length };
  }, [submitted, courses.data, aps, subjects]);

  function update(i: number, patch: Partial<SubjectMark>) {
    setSubjects((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Check my marks</h1>
        <p className="mt-1 text-muted-foreground">Add the subjects you wrote in matric and the percentages you got (or expect).</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-3">
            {subjects.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  list="sa-subjects"
                  value={s.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder={`Subject ${i + 1}`}
                  className="col-span-7 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="relative col-span-4">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={s.percent || ""}
                    onChange={(e) => update(i, { percent: Number(e.target.value) })}
                    placeholder="%"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubjects((a) => a.filter((_, idx) => idx !== i))}
                  className="col-span-1 grid place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-destructive"
                  aria-label="Remove subject"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <datalist id="sa-subjects">
              {COMMON_SA_SUBJECTS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSubjects((a) => [...a, { name: "", percent: 0 }])}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> Add subject
            </button>
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-accent/30 px-4 py-2 text-sm">
                Your APS: <strong className="text-lg text-foreground">{aps}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Sparkles className="h-4 w-4" /> Show my courses
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="mt-10">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-xl font-bold text-foreground">
                You qualify for {results.qualifying.length} of {results.total} courses
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.qualifying.map(({ course }) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  badge={<span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">Qualify</span>}
                />
              ))}
            </div>
            {results.qualifying.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Don't worry — check below for courses you're close to qualifying for, or explore the full catalogue.{" "}
                <Link to="/browse" className="font-semibold text-primary hover:underline">Browse all courses →</Link>
              </p>
            )}

            {results.close.length > 0 && (
              <>
                <div className="mt-12 flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <h2 className="text-lg font-semibold text-foreground">So close — almost qualifying</h2>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.close.map(({ course, result }) => (
                    <div key={course.id} className="rounded-2xl border border-dashed border-border bg-card/60 p-5">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{course.faculty}</div>
                      <h3 className="mt-1 font-semibold text-card-foreground">{course.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{course.university?.abbreviation}</p>
                      <ul className="mt-3 space-y-1 text-xs text-destructive">
                        {result.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}