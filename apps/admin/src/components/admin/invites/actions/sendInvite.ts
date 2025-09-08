"use server"
import { createAdminClient } from "@/utils/supabase/admin";
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
    invite

    const supabase = await createAdminClient();

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(invite.email)

    if (error) {
        console.log(error)
        throw new Error("Error while inviting user")
    }

    if (!data) {
        throw new Error("User Response had no data")
    }

    invite.user_id = data.user.id

    await prisma.inviteRequest.update({
        where: {
            id: invite.id
        },
        data: invite
    })

    revalidatePath("/admin/invites")
}