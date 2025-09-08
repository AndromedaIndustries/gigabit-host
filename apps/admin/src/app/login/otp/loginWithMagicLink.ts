"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export async function LoginWithMagicLink(formData: FormData) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOtp({
        email: formData.get("email") as string,
        options: {
            shouldCreateUser: false
        }
    })

    if (error) {
        redirect("/login?failed_to_request_otp");
    }

    redirect("/signup/success?type=otp");
}