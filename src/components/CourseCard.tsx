import { Link } from "@tanstack/react-router";
import type { Course } from "@/lib/data";
import { Building2, Clock, Award } from "lucide-react";

export function CourseCard({ course, badge }: { course: Course; badge?: React.ReactNode }) {
  return (
    <Link
      to="/courses/$id"
      params={{ id: course.id }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {course.faculty}
          </div>
          <h3 className="mt-1 font-semibold leading-tight text-card-foreground group-hover:text-primary">
            {course.name}
          </h3>
        </div>
        {badge}
      </div>
      {course.university && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          {course.university.name}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Award className="h-3.5 w-3.5" /> APS {course.min_aps}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {course.duration_years} years
        </span>
      </div>
    </Link>
  );
}