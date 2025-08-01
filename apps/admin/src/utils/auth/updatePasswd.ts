"use server";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function updatePassword(data: FormData) {
  const supabase = await createClient();

  // Authenticate the user by contacting the Supabase Auth server
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(`Failed to fetch user: ${userError.message}`);
  }

  const password = data.get("password") as string;

  const passwordReponse = await supabase.auth.updateUser({
    password: password,
  });

  console.log(passwordReponse.error)

  if (passwordReponse.error) {
    throw new Error(passwordReponse.error.message);
  }

  redirect("/dashboard/settings");
}
