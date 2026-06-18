import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { fetchCourses, fetchUniversities } from "@/lib/data";
import { Building2, MapPin } from "lucide-react";

export const Route = createFileRoute("/universities")({
  head: () => ({
    meta: [
      { title: "South African universities — CourseCompass" },
      { name: "description", content: "Browse SA's major universities and the courses they offer." },
    ],
  }),
  component: Universities,
});

function Universities() {
  const unis = useQuery({ queryKey: ["universities"], queryFn: fetchUniversities });
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Universities</h1>
        <p className="mt-1 text-muted-foreground">All the institutions currently in our catalogue.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(unis.data ?? []).map((u) => {
            const count = (courses.data ?? []).filter((c) => c.university_id === u.id).length;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                    {u.abbreviation}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold leading-tight text-card-foreground">{u.name}</h2>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {u.city}, {u.province}
                    </p>
                  </div>
                </div>
                {u.description && <p className="mt-3 text-sm text-muted-foreground">{u.description}</p>}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> {count} courses
                  </span>
                  <Link to="/browse" search={undefined as never} className="font-semibold text-primary hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}