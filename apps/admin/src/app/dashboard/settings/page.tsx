import { createClient } from "@/utils/supabase/server";
import { saveSettings, deleteAccount } from "./settings";
import AccountType from "@/components/input/accountType";
import SetName from "@/components/input/setName";
import { OpenPasswordModal, UpdatePasswordModal } from "@/components/modals/password";
import { SshCard } from "@/components/cards/ssh";
import { prisma } from "database";

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
        return (
            <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-2xl">You are not logged in</h1>
            </div>
        );
    }

    return (
        <div className="flex flex-row pt-20 px-10 pb-24">
            <div className="w-fit bg-base-200 border-base-300 rounded-box">
                <form action={saveSettings}>
                    <fieldset className="fieldset w-xs bg-base-200 border-base-300 p-4 ">
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
            <div className="bg-base-200 border-base-300 rounded-box gap-4 w-86 ml-4">
                <SshCard ssh_keys={sshKeys} userID={user.id} />
            </div>

            <div className="bg-base-200 border-base-300 rounded-box gap-4 w-86 ml-4">

                <fieldset className="fieldset w-xs bg-base-200 px-4 rounded-box">
                    <legend className="fieldset-legend">Account Settings</legend>
                </fieldset>

                <fieldset className="fieldset w-xs bg-base-200 px-4 rounded-box">
                    <OpenPasswordModal />

                    <form action={deleteAccount}>

                    </form>
                </fieldset>

                <fieldset className="fieldset w-xs bg-base-200 px-4 rounded-box">
                    <button type="submit" className="btn btn-secondary">Delete Account</button>
                </fieldset>

                <UpdatePasswordModal />
            </div>
        </div>
    );
}