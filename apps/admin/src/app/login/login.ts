"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    redirect("/login");
  }

  if (!data) {
    console.log("Failure with retriving user data `/login/login.ts`")
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  await prisma.audit_Log.create({
    data: {
      user_id: data.user.id,
      action: "user_login_event",
      description: `User logged in`,
    },
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
