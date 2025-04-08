import { createClient } from "@/utils/supabase/server";
import { saveSettings } from "./settings";

export default async function Settings() {
    const supabase = await createClient();

    const user = await (await supabase.auth.getUser()).data.user;
    const first_name = user?.user_metadata.first_name;
    const last_name = user?.user_metadata.last_name;
    const email = user?.email;
    const accountType = user?.user_metadata.account_type || "Set Account Type";
    return (
        <div>
            {/* Using a server action for form submission */}
            <form action={saveSettings}>
                <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
                    <legend className="fieldset-legend">Account Information</legend>

                    <label htmlFor="first_name" className="fieldset-label">First Name</label>
                    <input
                        required
                        id="first_name"
                        name="first_name"
                        type="text"
                        className="input"
                        defaultValue={first_name}
                    />

                    <label htmlFor="last_name" className="fieldset-label">Last Name</label>
                    <input
                        required
                        id="last_name"
                        name="last_name"
                        type="text"
                        className="input"
                        defaultValue={last_name}
                    />


                    <label htmlFor="email" className="fieldset-label">Email</label>
                    <input
                        required
                        id="email"
                        name="email"
                        type="text"
                        className="input"
                        defaultValue={email}
                    />

                    <label htmlFor="account_type" className="fieldset-label">Account Type</label>
                    <select
                        required
                        id="account_type"
                        name="account_type"
                        defaultValue={accountType}
                        className="select"
                    >
                        <option disabled>Set Account Type</option>
                        <option>Personal</option>
                        <option>Business</option>
                    </select>

                    <button type="submit" className="btn btn-primary">Save</button>
                </fieldset>
            </form>
        </div>
    );
}