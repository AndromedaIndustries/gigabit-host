import Link from 'next/link'
import { login } from './actions'


export default function LoginPage() {

    const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP || false;


    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center">
                <h1 className="text-2xl font-bold text-center">Log in</h1>
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

                <label className="input validator w-full">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Password Icon</title>
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                        </g>
                    </svg>
                    <input id="password" name="password" type="password" required placeholder="Password" minLength={8} pattern=".{12,}" title="Must be more than 12 characters" />
                </label>
                <p className="validator-hint hidden">Must be more than 12 characters</p>
                <button type="submit" formAction={login} className="btn btn-primary w-full">Log in</button>
                {allowSignup === "true" ?
                    <div className='align-middle flex flex-col justify-between'>
                        <div className="text-center">
                            Don&apos;t have an account?
                        </div>
                        <Link href={"/signup"} className="btn btn-outline btn-primary">Sign up</Link>

                    </div>
                    : <></>}
            </form>
        </div>
    )
}