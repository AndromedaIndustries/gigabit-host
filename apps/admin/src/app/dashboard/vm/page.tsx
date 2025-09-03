import { VmView } from "@/components/layouts/vms/vmParent";
import { GetCustomerActiveVMs } from "@/utils/database/common/vms";
import { createClient } from "@/utils/supabase/server";


export default async function VMs() {

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    if (typeof user_id != "undefined") {
        const vms = await GetCustomerActiveVMs(user_id);

        return (
            <div className="w-full pt-20 px-10 pb-24">
                <VmView vms={vms} />
            </div>
        );
    }

    return (
        <div className="w-full pt-20 px-10 pb-24">
            <div className="text-error">Error occured while retriveing VMs</div>
        </div>
    )
}