import { GetSku } from "@/components/layouts/vm/vmHelpers";
import { VmTable, VmTableShort } from "@/components/layouts/vm/vmTable";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";

export default async function Dashboard() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vms = await prisma.services.findMany({
        where: {
            user_id: user_id,
            subscription_active: true
        },
    });

    const vm_count = vms.length

    let total_cost = 1

    for await (const vm of vms) {
        const sku = await GetSku(vm.current_sku_id)
        if (sku != null) {
            total_cost += sku.price
        }
    }

    return (
        <div className="grid grid-cols-2 gap-5">
            <div className="card bg-base-300 shadow-sm p-4">
                <div className="card-body">
                    <div className="card-title pb-5">
                        Active VMs
                    </div>
                    <VmTableShort vms={vms.slice(0, 4)} />
                    <div className="card-actions pt-4">
                        <Link className="btn btn-primary" href={"/dashboard/vm"}>Manage All VMs</Link>
                    </div>
                </div>
            </div>
            <div className="card bg-base-300 shadow-sm p-4">
                <div className="card-body">
                    <div className="card-title pb-5">
                        Billing
                    </div>
                    <div className="text-lg">
                        Monthly costs: ${total_cost}
                    </div>
                </div>
            </div>
        </div>);
}