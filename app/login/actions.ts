"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user!.id)
    .single();

  redirect(profile?.role === "admin" ? "/admin" : "/tenant");
}
