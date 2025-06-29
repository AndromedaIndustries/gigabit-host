import { getStripe } from "@/utils/stripe/stripe";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";


export async function GET() {
    const authClient = await createClient();
    const user = await authClient.auth.getUser();

    if (!user) {
        throw new Error("No user found");
    }

    const user_mapping = prisma.third_Party_User_Mapping.findUnique({
        where: {
            id: user.data.user?.id
        }
    })

    if (!user_mapping) {
        throw new Error("No User Mapping Found")
    }

    const stripe = getStripe();

}
