import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";

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

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <h1>{vm?.hostname}</h1>

            <div>
                <h2>Subscription Status</h2>
                <p> {(vm.subscription_active) ? "Active" : "Inactive"} </p>
                {(vm.subscription_active) ? null : <p>Expires: End of current billing cycle</p>}
            </div>

            {(vm.subscription_active) ? (
                <form action={`/api/subscription/cancel?vm_id=${vm?.id}`} method="POST">
                    <button type="submit" className="btn btn-error">Cancel Subscription</button>
                </form>
            ) : null}
        </div>
    )
}