"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!URL) {
    throw new Error("Missing Supabase URL");
  }

  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!ANON_KEY) {
    throw new Error("Missing Supabase ANON KEY");
  }

  return createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
