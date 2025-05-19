import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

export default async function Dashboard() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vm_count = await prisma.services.count({
        where: {
            user_id: user_id,
            subscription_active: true
        },
    });

    return (
        <div>
            <div>
                Welcome to the dashboard!
            </div>
            <div>
                You have {vm_count} VMs active.
            </div>
        </div>);
}