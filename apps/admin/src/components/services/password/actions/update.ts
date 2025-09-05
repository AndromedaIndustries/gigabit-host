"use server"

import { createClient } from "@/utils/supabase/server"

export async function updatePassword(password: string) {
    const supabaseClient = await createClient()

    const user = (await supabaseClient.auth.getUser()).data.user

    if (!user) {
        throw new Error("user not found")
    }

    await supabaseClient.auth.updateUser({ password: password })
}