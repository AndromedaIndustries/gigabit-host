import { GetSku } from "@/components/services/vms/vmHelpers";
import { VmTable, VmTableShort } from "@/components/services/vms/vmTable";
import { GetCustomerActiveVMs } from "@/utils/database/common/vms";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id || null;

    if (user_id != null) {
        const vms = await GetCustomerActiveVMs(user_id);

        const vm_count = vms.length

        let total_cost = 0
        let active_subscriptions = 0

        for await (const vm of vms) {
            if (vm.subscription_active) {
                const sku = await GetSku(vm.current_sku_id)
                active_subscriptions++
                if (sku != null) {
                    total_cost += sku.price
                }
            }
        }




        return (
            <div className="grid grid-cols-4 gap-5 pt-20 px-10 pb-24">
                <div className="card bg-base-300 shadow-sm p-4 col-span-3">
                    <div className="card-body">
                        <div className="card-title pb-5">
                            Active VMs
                        </div>
                        <VmTableShort vms={vms.slice(0, 4)} />
                        <div className="card-actions pt-4">
                            <Link className="btn btn-accent" href={"/dashboard/vm"}>Manage All VMs</Link>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-300 shadow-sm p-4">
                    <div className="card-body">
                        <div className="card-title pb-5">
                            Billing
                        </div>
                        {(total_cost > 0) ? (
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th className="text-right">Active Subscriptions:</th>
                                        <th className="text-left">{active_subscriptions}</th>
                                    </tr>
                                    <tr>
                                        <th className="text-right">Monthly Costs:</th>
                                        <th className="text-left">${total_cost}</th>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-lg">
                                You have no active subscriptions
                            </div>
                        )}
                    </div>
                </div>
            </div>);
    }


    redirect("/dashboard/login")

}