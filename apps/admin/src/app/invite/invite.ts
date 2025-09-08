"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export async function invite(formData: FormData) {
    const supabase = await createClient();

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const account_type = formData.get("account_type") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const invite_code_string = formData.get("invite_code") as string;

    const invite_code = invite_code_string.toLowerCase()

    const inviteObject = await prisma.inviteCode.findUnique({
        where: {
            inviteCode: invite_code
        }
    })

    if (inviteObject == null) {
        redirect("/invite?error=invalid_invite_code&error=1")
    }

    if (inviteObject.uses >= inviteObject.maxUses) {
        redirect("/invite?error=invalid_invite_code&error=2")
    }

    await prisma.inviteCode.update({
        where: {
            inviteCode: invite_code
        },
        data: {
            uses: inviteObject.uses + 1
        }
    })

    const now = Date.now()
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

    const user = authResponse.data.user

    if (user == null) {
        redirect("/invite?error=invalid_invite_code&error=3")
    }

    const userId = user.id

    await prisma.audit_Log.create({
        data: {
            user_id: userId,
            action: "user_signup_via_invite_code",
            description: `User signed up with invite code ${invite_code_string}`,
        },
    });



    if (authResponse.error) {
        redirect("/error");
    }

    redirect("/signup/success?type=invite");
}
