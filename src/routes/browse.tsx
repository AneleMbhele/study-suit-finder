import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { CourseCard } from "@/components/CourseCard";
import { fetchCourses, fetchUniversities } from "@/lib/data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse courses — CourseCompass" },
      { name: "description", content: "Browse and filter every undergraduate course in our catalogue by university, faculty, and APS." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const unis = useQuery({ queryKey: ["universities"], queryFn: fetchUniversities });

  const [q, setQ] = useState("");
  const [uni, setUni] = useState("");
  const [faculty, setFaculty] = useState("");
  const [maxAps, setMaxAps] = useState<number | "">("");

  const faculties = useMemo(() => {
    const set = new Set((courses.data ?? []).map((c) => c.faculty));
    return Array.from(set).sort();
  }, [courses.data]);

  const filtered = useMemo(() => {
    return (courses.data ?? []).filter((c) => {
      if (q && !`${c.name} ${c.faculty}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (uni && c.university_id !== uni) return false;
      if (faculty && c.faculty !== faculty) return false;
      if (maxAps !== "" && c.min_aps > Number(maxAps)) return false;
      return true;
    });
  }, [courses.data, q, uni, faculty, maxAps]);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse courses</h1>
        <p className="mt-1 text-muted-foreground">Filter to narrow down what you're considering.</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="sr-only">Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by course name…"
                className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </label>
          <select value={uni} onChange={(e) => setUni(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">All universities</option>
            {(unis.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.abbreviation} — {u.name}</option>
            ))}
          </select>
          <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">All faculties</option>
            {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <label className="md:col-span-4 flex items-center gap-3 text-sm text-muted-foreground">
            Max APS:
            <input
              type="number"
              min={1}
              max={49}
              value={maxAps}
              onChange={(e) => setMaxAps(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 35"
              className="w-32 rounded-xl border border-input bg-background px-3 py-2 text-sm"
            />
            <span className="ml-auto text-xs">{filtered.length} of {courses.data?.length ?? 0} courses</span>
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
          {courses.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!courses.isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No courses match those filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}