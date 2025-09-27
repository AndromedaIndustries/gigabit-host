import { prisma } from "database";

export default async function generateInviteCode(length: number): Promise<string> {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const code_exists = await prisma.inviteCode.findFirst({
        where: {
            inviteCode: result
        }
    })

    if (code_exists) {
        return generateInviteCode(length)
    }

    return result;
}