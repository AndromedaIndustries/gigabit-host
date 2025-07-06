import AccountType from '@/components/input/accountType'
import SetName from '@/components/input/setName'
import { redirect } from 'next/navigation';
import { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { update } from './update';


export default async function UpdatePage() {
    const supabase = await createClient();

    const userResponse = await supabase.auth.getUser();

    const user = userResponse.data.user;

    if (user === null) {
        redirect("/dashboard/login")
    }

    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center">
                <fieldset>
                    <h1 className="text-2xl font-bold text-center">Finish Creating your Account</h1>

                    <SetName />

                    <label htmlFor="email" className="fieldset-label">Email</label>
                    <input id="email" name="email" type="email" className="input w-full" defaultValue={user.email} />

                    <label htmlFor="password" className="fieldset-label">Password</label>
                    <input id="password" name="password" type="password" className="input w-full" required placeholder="Password" minLength={8} pattern=".{12,}" title="Must be more than 12 characters" />

                    <AccountType />

                    <p className="validator-hint hidden">Must be more than 12 characters</p>
                    <div className='align-middle flex flex-col justify-between pt-6'>
                        <button type="submit" formAction={update} className="btn btn-outline btn-primary">Complete your account setup</button>
                    </div>
                </fieldset>
            </form>
        </div>
    )
}