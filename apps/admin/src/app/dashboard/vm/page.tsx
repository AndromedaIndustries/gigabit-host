import { VmCard } from "@/components/cards/vm";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link"

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

    let totalCosts = 0;
    let totalVms = 0;

    // Calculate total costs for all VMs
    for (const vm of vms) {
        totalVms++;
        const sku = await prisma.sku.findUnique({
            where: {
                id: vm.current_sku_id
            },
        });
        if (sku) {
            totalCosts += sku.price;
        }
    }

    return (
        <div className="w-full h-fit pb-24">
            <div className="flex flex-row flex-wrap space-x-5 space-y-5">
                <div className="card card-border bg-base-300 w-64 h-64">
                    <div className="card-body items-center text-center">
                        <div className="card-title text-2xl">Total Costs</div>
                        <div className="text-lg">
                            {totalCosts.toFixed(2)} <span className="text-sm">$/mo</span>
                        </div>
                        <div className="card-title text-2xl">Total VMs</div>
                        <div className="text-lg">
                            {totalVms}
                        </div>
                        <Link href={"/dashboard/vm/new"} className="btn btn-outline btn-primary mt-auto">
                            Add new VM
                        </Link>
                    </div>
                </div>

                {vms.length === 0 ? null :
                    vms.map((vm) => (
                        // Render each VM card
                        <VmCard vm={vm} key={vm.id} />
                    ))}
            </div>
        </div>
    );
}