import AccountType from '@/components/input/accountType'
import { invite } from './invite'
import SetName from '@/components/input/setName'
import Link from 'next/link'

export default function InvitePage() {

    return (
        <div className="flex items-center justify-center h-screen bg-base-100 mb-10">
            <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center">
                <fieldset>
                    <h1 className="text-2xl font-bold text-center">Create Account</h1>

                    <SetName />

                    <label htmlFor="email" className="fieldset-label">Email</label>
                    <input id="email" name="email" type="email" className="input w-full" required placeholder='user@domain.tld' />

                    <label htmlFor="password" className="fieldset-label">Password</label>
                    <input id="password" name="password" type="password" className="input w-full" required placeholder="Password" minLength={8} pattern=".{12,}" title="Must be more than 12 characters" />
                    <p className="validator-hint hidden">Must be more than 12 characters</p>
                    <AccountType />

                    <label htmlFor="password" className="fieldset-label">Invite Code</label>
                    <input id="invite_code" name="invite_code" type="text" className="input w-full" />



                    <div className='align-middle flex flex-col justify-between pt-6 gap-2'>
                        <button type="submit" formAction={invite} className="btn btn-accent">Create Account</button>

                        <Link href={"/dashboard/login"} className="btn btn-accent btn-outline w-full"> Back to Sign in page</Link>
                        <label htmlFor="request_invie" className="fieldset-label">Don't have an invite code?</label>
                        <Link href={"/dashboard/invite/request"} className="btn btn-accent btn-outline w-full">Request an Invite</Link>
                    </div>
                </fieldset>
            </form>
        </div>
    )
}