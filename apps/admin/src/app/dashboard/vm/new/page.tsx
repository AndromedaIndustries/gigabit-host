import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import OsSelector from "@/components/input/osSelector";
import { VM_Specs } from "@/components/services/vms/vms";
import { AddSSHKeyModalDialog, SshKeyModalButton } from "@/components/services/ssh/addModal";

export default async function Purchase() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const account_type = userObject.data.user?.app_metadata?.account_type
    const userID = userObject.data.user?.id

    if (!userID) {
        throw new Error("No user found");
    }

    const sshKeys = await prisma.ssh_keys.findMany({
        where: {
            user_id: userID,
        },
    })

    const vms = await prisma.sku.findMany(
        {
            where: {
                sku_type: "virtual_machine",
            },
            orderBy: {
                price: 'asc'
            }
        }
    )

    return (
        <div className="pt-20 px-10 pb-24">
            <form action="/api/checkout/session" method="POST">
                <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box justify-center w-fit md:w-2/4">
                    <legend className="fieldset-legend">Configure your VM</legend>

                    {(account_type !== "Personal") || (account_type !== "Business") && (
                        <div>
                            <div className="alert alert-error">
                                You must set your account type before purchasing a VM.
                            </div>
                            <label htmlFor="account_type" className="fieldset-label">Account Type</label>
                            <select
                                required
                                id="account_type"
                                name="account_type"
                                defaultValue={account_type}
                                className="select w-full"
                            >
                                <option disabled>Set Account Type</option>
                                <option>Personal</option>
                                <option>Business</option>
                            </select>
                        </div>
                    )}

                    <label htmlFor="hostname" className="fieldset-label">Hostname</label>
                    <input id="hostname" name="hostname" type="text" className="input validator w-full" required placeholder="my.awesome.server"
                        pattern="\b[a-z0-9\-\.]*\.[a-z]{1,}\b"
                        title="Must be valid FQDN" />

                    <VM_Specs vm_list={vms} />

                    <OsSelector />

                    <label htmlFor="ssh_user" className="fieldset-label">Username</label>
                    <input id="ssh_user" name="ssh_user" type="text" className="input validator w-full" required placeholder="imauser"
                        pattern="\b[a-z0-9\-]*"
                        title="Must be a valid *nix username" />

                    <label htmlFor="public_key_id" className="fieldset-label">SSH Public Key</label>
                    <div className="join w-full">
                        <div className="w-full">
                            <select id="public_key_id" name="public_key_id" className="select select-bordered w-full">
                                {sshKeys.map((sshKey) => (
                                    <option key={sshKey.id} value={sshKey.id} className="flex flex-col">
                                        {sshKey.name}
                                    </option>
                                ))}
                            </ select>
                        </div>
                        <SshKeyModalButton additionalCss="btn-success join-item" />
                    </div>


                    <div className="w-full pt-5">
                        <button type="submit" className="btn btn-accent w-full">Purchase</button>
                    </div>

                </fieldset>
            </form>
            <div>
                <AddSSHKeyModalDialog revalidatePathString="/dashboard/vm/new" />
            </div>
        </div >
    )
}