import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!URL) {
    throw new Error("Missing Supabase URL");
  }

  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!ANON_KEY) {
    throw new Error("Missing Supabase ANON KEY");
  }

  return createBrowserClient(URL, ANON_KEY);
}
