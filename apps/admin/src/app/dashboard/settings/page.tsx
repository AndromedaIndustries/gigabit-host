import { createClient } from "@/utils/supabase/server";
import { saveSettings, deleteAccount } from "./settings";
import AccountType from "@/components/input/accountType";
import SetName from "@/components/input/setName";
import { OpenPasswordModalButton, UpdatePasswordModal } from "@/components/services/password/password";
import { prisma } from "database";
import { SshTable } from "@/components/services/ssh/ssh";
import { SshKeyModalButtonAndModal } from "@/components/services/ssh/addModal";

export default async function Settings() {
    const supabase = await createClient();

    const user = await (await supabase.auth.getUser()).data.user;
    const first_name = user?.user_metadata.first_name;
    const last_name = user?.user_metadata.last_name;
    const email = user?.email;
    const accountType = user?.user_metadata.account_type || "Set Account Type";
    const sshKeys = await prisma.ssh_keys.findMany({
        where: {
            user_id: user?.id,
        },
        orderBy: {
            name: 'asc'
        }
    })

    if (!user) {
        throw new Error("user not found")
    }

    return (
        <div className="flex flex-row pt-20 px-2 pb-24 gap-3">
            <div className="card w-sm bg-base-200 border-base-300">
                <div className="card-body">
                    <div className="card-title">Account Information</div>
                    <form action={saveSettings}>
                        <fieldset className="fieldset p-4 ">
                            <legend className="fieldset-legend">Personal Information</legend>

                            <label htmlFor="email" className="fieldset-label">Email</label>
                            <input
                                required
                                disabled
                                id="email"
                                name="email"
                                type="text"
                                className="input"
                                defaultValue={email}
                            />

                            <SetName first_name={first_name} last_name={last_name} />

                            <AccountType accountType={accountType} />

                            <button type="submit" className="btn btn-accent mt-4">Save</button>
                        </fieldset>
                    </form>
                </div>
            </div>
            <div className="card bg-base-200 w-sm border-base-300">
                <div className="card-body grid grid-cols-1 gap-3 content-start">
                    <div className="card-title">SSH Keys</div>
                    <SshKeyModalButtonAndModal additionalCss="btn-accent w-40" />
                    <SshTable ssh_keys={sshKeys} />
                </div>
            </div>
            <div className="card bg-base-200 border-base-300">
                <div className="card-body grid grid-cols-1 gap-5 content-start">
                    <div className="card-title">Account Actions</div>

                    <OpenPasswordModalButton customCss="w-40" />

                    <form action={deleteAccount}>
                        <button type="submit" className="btn btn-secondary w-40">Delete Account</button>
                    </form>
                </div>
            </div>

            <UpdatePasswordModal />
        </div>
    );
}