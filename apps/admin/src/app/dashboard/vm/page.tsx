import { VmView } from "@/components/layouts/vm/vmParent";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";


export default async function VMs() {

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vms = await prisma.services.findMany({
        where: {
            user_id: user_id,
            service_active: true
        },
    });

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <VmView vms={vms} />
        </div>
    );
}