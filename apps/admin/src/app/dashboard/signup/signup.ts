"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const account_type = formData.get("account_type") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string

  const authResponse = await supabase.auth.signUp({
    email: email as string,
    password: password,
    options: {
      data: {
        first_name: first_name,
        last_name: last_name,
        account_type: account_type,
      },
    },
  });

  if (authResponse.error) {
    redirect("/error");
  }

  const user = authResponse.data.user

  if (user == null) {
    redirect("/dashboard/invite?error=invalid_invite_code&error=3")
  }

  await prisma.audit_Log.create({
    data: {
      user_id: user.id,
      action: "user_signup_event",
      description: `User signed up for a new account`,
    },
  });



  redirect("/dashboard/signup/success");
}
