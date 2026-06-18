import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { fetchCourse } from "@/lib/data";
import { ArrowLeft, Award, Building2, Clock, ExternalLink, Briefcase, BookOpen } from "lucide-react";

export const Route = createFileRoute("/courses/$id")({
  component: CourseDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-destructive" role="alert">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Course not found.</div>
  ),
});

function CourseDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
  });

  if (isLoading) return <Loading />;
  if (error) throw error;
  if (!data) throw notFound();

  const reqs = Object.entries(data.subject_requirements ?? {});

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>

        <div className="mt-4 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">{data.faculty}</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
          {data.university && (
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{data.university.name}</span>
              <span>•</span>
              <span>{data.university.city}, {data.university.province}</span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat icon={<Award className="h-4 w-4" />} label="Minimum APS" value={String(data.min_aps)} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Duration" value={`${data.duration_years} years`} />
            <Stat icon={<BookOpen className="h-4 w-4" />} label="Qualification" value={data.qualification_type} />
          </div>

          {data.description && <p className="mt-6 text-foreground/80">{data.description}</p>}

          {reqs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subject requirements</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {reqs.map(([subject, level]) => (
                  <li key={subject} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-2 text-sm">
                    <span className="font-medium text-foreground">{subject}</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">Level {level}+</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.career_outcomes && data.career_outcomes.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Briefcase className="h-4 w-4" /> Where it can take you
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.career_outcomes.map((c) => (
                  <span key={c} className="rounded-full bg-accent/30 px-3 py-1 text-sm text-accent-foreground">{c}</span>
                ))}
              </div>
            </section>
          )}

          {data.university?.website && (
            <a
              href={data.university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
            >
              Visit {data.university.abbreviation} <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-muted-foreground">Loading course…</div>
    </div>
  );
}