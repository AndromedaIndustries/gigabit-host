"use server"

import { prisma } from "database";


export async function RequestInvite(prevState: any, formData: FormData) {

    const email = formData.get("email") as string;
    const purpose = formData.get("purpose") as string;
    const use_case = formData.get("use_case") as string;

    const InviteRequest = await prisma.inviteRequest.findFirst({
        where: {
            email: email
        }
    })

    if (InviteRequest != null) {
        return { message: 'Invite request found for this Email Address', css: "alert-error", alert: "failure" }
    }

    try {
        await prisma.inviteRequest.create({
            data: {
                email: email,
                purpose: purpose,
                use: use_case
            }
        })
        return { message: 'Invite has been recieved', css: "alert-success", alert: "success" }
    } catch {
        return { message: 'Failed to create Invite Request', css: "alert-error", alert: "failure" }
    }
}