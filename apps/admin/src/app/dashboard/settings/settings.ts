"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// This action runs on the server
export async function saveSettings(data: FormData) {
  const email = data.get("email") as string;
  const accountType = data.get("account_type") as string;
  const first_name = data.get("first_name") as string;
  const last_name = data.get("last_name") as string;

  const supabase = await createClient();

  const response = await supabase.auth.updateUser({
    email: email,
    data: {
      first_name: first_name,
      last_name: last_name,
      account_type: accountType,
    },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  // Optionally revalidate the current page (if using ISR)
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings");
}
