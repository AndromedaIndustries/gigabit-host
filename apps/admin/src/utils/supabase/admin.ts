"use server";
import { createClient } from "@supabase/supabase-js";

export async function createAdminClient() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!URL) {
    throw new Error("Missing Supabase URL");
  }

  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase SERVICE_ROLE KEY");
  }

  return createClient(URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
