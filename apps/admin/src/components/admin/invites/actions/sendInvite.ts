"use server"
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { revalidatePath } from "next/cache";


export async function SendInvite(id: string) {
    const invite = await prisma.inviteRequest.findUnique({
        where: {
            id: id
        }
    })

    if (!invite) {
        throw new Error("Invite Not Found")
    }
    const timestamp = Date.now()

    invite.sent_at = new Date(timestamp)

    const supabase = await createClient()

    const user = (await supabase.auth.getUser()).data.user

    if (!user) {
        throw new Error("User not signed in")
    }

    const supabaseAdmin = await createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(invite.email)

    if (error) {
        console.log(error)
        throw new Error("Error while inviting user")
    }

    if (!data) {
        throw new Error("User Response had no data")
    }

    invite.user_id = data.user.id
    console.log(data.user.id)

    await prisma.inviteRequest.update({
        where: {
            id: invite.id
        },
        data: invite
    })

    await prisma.audit_Log.create({
        data: {
            user_id: user.id,
            action: "approved_invite_request",
            description: `"User invited ${invite.email} to create an account`
        }
    })

    revalidatePath("/admin/invites")
}