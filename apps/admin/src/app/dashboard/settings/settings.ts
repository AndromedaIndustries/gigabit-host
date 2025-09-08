"use server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
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

  const user = response.data.user

  await prisma.audit_Log.create({
    data: {
      user_id: user.id,
      action: "user_deleted_account",
      description: `User deleted account with ID ${user.id}`,
    },
  });

  // Optionally revalidate the current page (if using ISR)
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();
  const userObject = await supabase.auth.getUser();

  if (!userObject) {
    supabaseAdmin.auth.signOut();
    throw new Error("No signed in user found");
  }

  if (!userObject.data.user) {
    supabaseAdmin.auth.signOut();
    throw new Error("No user found");
  }

  const user_id = userObject.data.user.id;

  if (userObject.data.user.role === "superadmin") {
    supabaseAdmin.auth.signOut();
    throw new Error("Superadmins cannot delete their account");
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

  if (error) {
    supabaseAdmin.auth.signOut();
    throw new Error(error.message);
  }

  supabaseAdmin.auth.signOut();

  await prisma.audit_Log.create({
    data: {
      user_id: user_id,
      action: "user_deleted_account",
      description: `User deleted account with ID ${user_id}`,
    },
  });

  redirect("/login");
}
