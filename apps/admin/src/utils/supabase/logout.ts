"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}
