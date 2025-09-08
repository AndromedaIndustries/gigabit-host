"use server"

import { createClient } from "@/utils/supabase/server"
import { prisma } from "database"

export async function updatePassword(formData: FormData) {
    const password = formData.get("password") as string

    const supabaseClient = await createClient()

    const user = (await supabaseClient.auth.getUser()).data.user

    if (!user) {
        throw new Error("user not found")
    }

    await prisma.audit_Log.create({
        data: {
            user_id: user.id,
            action: "deleted_firewall_rule",
            description: `User updated their password`,
        },
    });

    await supabaseClient.auth.updateUser({ password: password })
}