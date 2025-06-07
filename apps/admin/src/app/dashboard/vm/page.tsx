import { VmRow } from "@/components/cards/vm";
import { VmView } from "@/components/layouts/vm/vmParent";
import { createClient } from "@/utils/supabase/server";
import { prisma, type Services } from "database";


export default async function VMs() {

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vms = await prisma.services.findMany({
        where: {
            user_id: user_id,
            subscription_active: true
        },
    });

    return (
        <div className="w-full h-fit pb-24">
            <VmView vms={vms} />
        </div>
    );
}

export async function VmTable({ vms }: { vms: Services[] }) {
    return (
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Hostname</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>IPv4 Address</th>
                    <th>IPv6 Address</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {vms.map((vm) => (
                    <VmRow key={vm.id} vm={vm} />
                ))}
            </tbody>
        </table>
    );
}

export async function VmCards({ vms }: { vms: Services[] }) {
    return (
        <div className="flex flex-row flex-wrap space-x-5 space-y-5">
            <VmCards vms={vms} />
        </div>
    );
}