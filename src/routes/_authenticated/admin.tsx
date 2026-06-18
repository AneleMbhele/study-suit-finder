import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";
import { fetchCourses, fetchUniversities, type Course, type University } from "@/lib/data";
import { Pencil, Trash2, Plus, X, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — CourseCompass" }] }),
  component: Admin,
});

function Admin() {
  const [tab, setTab] = useState<"courses" | "universities">("courses");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Admin</span>
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Manage catalogue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit and remove universities and courses.{" "}
          <Link to="/" className="text-primary hover:underline">Go to site →</Link>
        </p>

        <div className="mt-6 inline-flex gap-1 rounded-xl bg-secondary p-1">
          <TabBtn active={tab === "courses"} onClick={() => setTab("courses")}>Courses</TabBtn>
          <TabBtn active={tab === "universities"} onClick={() => setTab("universities")}>Universities</TabBtn>
        </div>

        <div className="mt-6">
          {tab === "courses" ? <CoursesAdmin /> : <UniversitiesAdmin />}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${active ? "bg-card text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function UniversitiesAdmin() {
  const qc = useQueryClient();
  const unis = useQuery({ queryKey: ["universities"], queryFn: fetchUniversities });
  const [editing, setEditing] = useState<Partial<University> | null>(null);

  const save = useMutation({
    mutationFn: async (u: Partial<University>) => {
      const payload = {
        name: u.name!,
        abbreviation: u.abbreviation!,
        city: u.city!,
        province: u.province!,
        website: u.website || null,
        description: u.description || null,
      };
      if (u.id) {
        const { error } = await supabase.from("universities").update(payload).eq("id", u.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("universities").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["universities"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("universities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["universities"] }),
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New university
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Abbr</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Location</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {(unis.data ?? []).map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold text-primary">{u.abbreviation}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.city}, {u.province}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(u)} className="mr-1 rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Delete ${u.name}? This removes all its courses.`) && del.mutate(u.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit university" : "Add university"} onClose={() => setEditing(null)}>
          <form
            onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            className="space-y-3"
          >
            <TextInput label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} required />
            <TextInput label="Abbreviation" value={editing.abbreviation ?? ""} onChange={(v) => setEditing({ ...editing, abbreviation: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="City" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} required />
              <TextInput label="Province" value={editing.province ?? ""} onChange={(v) => setEditing({ ...editing, province: v })} required />
            </div>
            <TextInput label="Website" value={editing.website ?? ""} onChange={(v) => setEditing({ ...editing, website: v })} />
            <TextArea label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
            {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
            <button type="submit" disabled={save.isPending} className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function CoursesAdmin() {
  const qc = useQueryClient();
  const courses = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });
  const unis = useQuery({ queryKey: ["universities"], queryFn: fetchUniversities });
  const [editing, setEditing] = useState<Partial<Course> | null>(null);

  const save = useMutation({
    mutationFn: async (c: Partial<Course>) => {
      const payload = {
        university_id: c.university_id!,
        name: c.name!,
        faculty: c.faculty!,
        qualification_type: c.qualification_type || "Bachelor's Degree",
        duration_years: Number(c.duration_years) || 3,
        min_aps: Number(c.min_aps) || 0,
        subject_requirements: c.subject_requirements || {},
        description: c.description || null,
        career_outcomes: c.career_outcomes || [],
      };
      if (c.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing({ subject_requirements: {}, career_outcomes: [], duration_years: 3 })} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New course
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Faculty</th><th className="px-4 py-3">University</th><th className="px-4 py-3">APS</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {(courses.data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.faculty}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.university?.abbreviation}</td>
                <td className="px-4 py-3">{c.min_aps}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="mr-1 rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm(`Delete ${c.name}?`) && del.mutate(c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit course" : "Add course"} onClose={() => setEditing(null)}>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">University</span>
              <select required value={editing.university_id ?? ""} onChange={(e) => setEditing({ ...editing, university_id: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select…</option>
                {(unis.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <TextInput label="Course name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Faculty" value={editing.faculty ?? ""} onChange={(v) => setEditing({ ...editing, faculty: v })} required />
              <TextInput label="Qualification type" value={editing.qualification_type ?? "Bachelor's Degree"} onChange={(v) => setEditing({ ...editing, qualification_type: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Min APS" value={editing.min_aps ?? 0} onChange={(v) => setEditing({ ...editing, min_aps: v })} />
              <NumberInput label="Duration (years)" value={editing.duration_years ?? 3} step={0.5} onChange={(v) => setEditing({ ...editing, duration_years: v })} />
            </div>
            <TextArea label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
            <TextInput
              label="Subject requirements (e.g. Mathematics:5, English:5)"
              value={Object.entries(editing.subject_requirements ?? {}).map(([k, v]) => `${k}:${v}`).join(", ")}
              onChange={(v) => {
                const obj: Record<string, number> = {};
                v.split(",").forEach((p) => {
                  const [k, val] = p.split(":").map((s) => s.trim());
                  if (k && val) obj[k] = Number(val);
                });
                setEditing({ ...editing, subject_requirements: obj });
              }}
            />
            <TextInput
              label="Career outcomes (comma separated)"
              value={(editing.career_outcomes ?? []).join(", ")}
              onChange={(v) => setEditing({ ...editing, career_outcomes: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
            {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
            <button type="submit" disabled={save.isPending} className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}

function NumberInput({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type="number" step={step ?? 1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
    </label>
  );
}