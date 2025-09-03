import { GetSku } from "@/components/layouts/vms/vmHelpers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";

export default async function VmManagementPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const { id } = await params;

    const vm = await prisma.services.findFirst({
        where: {
            user_id: user_id,
            id: id,
        },
    });

    if (!vm) {
        throw new Error("VM not found");
    }

    const currentSku = await GetSku(vm.sku_id)

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <div className="grid grid-cols-2 gap-2">
                <div className="card bg-base-200 ">
                    <div className="card-body">
                        <div className="card-title">Host Overview</div>
                        <div className="grid grid-cols-2">
                            <div >Hostname:</div>
                            <div >{vm?.hostname}</div>
                            <div >Size:</div>
                            <div >{currentSku?.name}</div>
                            <div >Created:</div>
                            <div >{vm?.created_at.toDateString()}</div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-200 ">
                    <div className="card-body">
                        <div className="card-title">VM Configurations</div>
                        <ul>
                            <li>
                                <Link href={`/dashboard/vm/${vm.id}/firewall`} className="btn btn-primary">
                                    Firewall Settings
                                </Link>
                            </li>
                        </ul>

                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="card-body grid grid-cols-2">
                        <div>
                            <div className="card-title text-accent">Subscription Status</div>
                            <p> {(vm.subscription_active) ? "Active" : "Inactive"} </p>
                            {(vm.subscription_active) ? null : <p>Expires: End of current billing cycle</p>}
                        </div>

                        <div className="place-content-center">
                            {(vm.subscription_active) ? (
                                <form action={`/api/subscription/cancel?vm_id=${vm?.id}`} method="POST">
                                    <button type="submit" className="btn btn-error btn-sm">Cancel Subscription</button>
                                </form>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}