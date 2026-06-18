import { supabase } from "@/integrations/supabase/client";

export type University = {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  province: string;
  website: string | null;
  description: string | null;
  logo_url: string | null;
};

export type Course = {
  id: string;
  university_id: string;
  name: string;
  faculty: string;
  qualification_type: string;
  duration_years: number;
  min_aps: number;
  subject_requirements: Record<string, number>;
  description: string | null;
  career_outcomes: string[] | null;
  university?: University;
};

export async function fetchUniversities(): Promise<University[]> {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as University[];
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, university:universities(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as Course[];
}

export async function fetchCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, university:universities(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Course | null;
}