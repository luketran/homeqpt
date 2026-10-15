import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database, UserRole } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Trả về user + profile, hoặc null nếu chưa đăng nhập. */
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

/** Bắt buộc đăng nhập; nếu chưa -> /login. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Bắt buộc đúng role, nếu sai -> về trang của role đó. */
export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) {
    redirect(profile.role === "admin" ? "/admin" : "/tenant");
  }
  return profile;
}
