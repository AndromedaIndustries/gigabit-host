"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function update(formData: FormData) {
    const supabase = await createClient();

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const account_type = formData.get("account_type") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({
        email: email,
        password: password,
        data: {
            first_name: first_name,
            last_name: last_name,
            account_type: account_type,
        }
    });

    if (error) {
        redirect("/error");
    };

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
}
