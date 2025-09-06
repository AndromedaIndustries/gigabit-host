"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { revalidatePath } from "next/cache";

export async function NewSshKey(formData: FormData, revalidatePathString: string) {
    const supabaseClint = await createClient();

    const user = (await supabaseClint.auth.getUser()).data.user;

    if (!user) {
        throw new Error("user not found")
    }

    const pubKey = formData.get("public_key")?.toString()

    if (!pubKey) {
        throw new Error("ssh key not provided")
    }
    const keyName = formData.get("name")?.toString()

    if (!keyName) {
        throw new Error("key name not provided")
    }

    const sshParts = pubKey.split(' ')

    // discard the comment, we only care about key type and key data
    const keyType = sshParts[0];
    const keyData = sshParts[1];

    const validKeyTypes = ['ssh-rsa', 'ecdsa-sha2-nistp256', 'ssh-ed25519'];
    if (!validKeyTypes.includes(keyType)) {
        throw new Error("invalid key type")
    }

    // Attempt to decode Base64 to check validity
    try {
        Buffer.from(keyData, 'base64').toString('binary');
    } catch (error) {
        throw new Error("key hash")
    }

    const sanitizedKey = keyType + " " + keyData

    const userId = user.id

    const created_ssh_key = await prisma.ssh_keys.create({
        data: {
            name: keyName,
            public_key: sanitizedKey,
            user_id: userId
        }
    })

    if (!created_ssh_key.id) {
        throw new Error("Error inserting key")
    }

    revalidatePath(revalidatePathString)

}