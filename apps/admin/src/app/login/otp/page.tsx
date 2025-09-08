import Link from 'next/link'
import { LoginWithMagicLink } from './loginWithMagicLink';


export default function OtpLoginPage() {

    const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP || false;

    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center">
                <h1 className="text-2xl font-bold text-center">Login with Magic Link</h1>
                <label className="input validator w-full">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Email Icon</title>
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </g>
                    </svg>
                    <input id="email" name="email" type="email" required placeholder='user@domain.tld' />
                </label>
                <div className="validator-hint hidden">Enter valid email address</div>


                <button type="submit" formAction={LoginWithMagicLink} className="btn btn-accent w-full">Send Email</button>
                <Link href={"/login"} className="btn btn-accent btn-outline w-full"> Back to Sign in page</Link>
            </form>
        </div>
    )
}