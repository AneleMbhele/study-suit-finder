import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { CourseCard } from "@/components/CourseCard";
import { fetchCourses, fetchUniversities } from "@/lib/data";
import { Calculator, Search, GraduationCap, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourseCompass — Find the right university course for your marks" },
      { name: "description", content: "Enter your South African matric marks once and instantly see every university course you qualify for. UCT, Wits, UP, Stellenbosch and more." },
    ],
  }),
  component: Home,
});

function Home() {
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const unis = useQuery({ queryKey: ["universities"], queryFn: fetchUniversities });
  const featured = (courses.data ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground shadow-[var(--shadow-card)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for South African matriculants
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              Find the courses
              <br />
              <span className="text-primary">your marks unlock.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Stop digging through ten prospectuses. Punch in your matric subjects and we'll show you every degree you qualify for — across SA's top universities.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/check"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Calculator className="h-5 w-5" /> Check my marks
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Search className="h-5 w-5" /> Browse all courses
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Stat n={unis.data?.length ?? 10} label="Universities" />
              <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
              <Stat n={courses.data?.length ?? 35} label="Courses" />
              <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
              <Stat n={9} label="Provinces" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Step n={1} icon={<Calculator className="h-5 w-5" />} title="Enter your subjects" body="Add the seven NSC subjects you wrote and the percentage you got (or expect to get)." />
          <Step n={2} icon={<GraduationCap className="h-5 w-5" />} title="We crunch the APS" body="We compute your APS automatically and check each course's subject requirements." />
          <Step n={3} icon={<CheckCircle2 className="h-5 w-5" />} title="See where you fit" body="A clean list of every degree you qualify for, with the university and what it leads to." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Popular courses</h2>
            <p className="text-sm text-muted-foreground">A glimpse of what's in the catalogue.</p>
          </div>
          <Link to="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <p>© CourseCompass — Helping SA learners pick the right next step.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return <span><strong className="font-semibold text-foreground">{n}+</strong> {label}</span>;
}

function Step({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {n}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}