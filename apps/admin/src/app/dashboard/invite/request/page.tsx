'use client';
import { useActionState } from "react";
import { RequestInvite } from "./requestInvite";
import Link from "next/link";

const initialState = {
    message: '',
    css: '',
    alert: ''
}


export default function InvitePage() {
    const [state, formAction, _] = useActionState(RequestInvite, initialState)


    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center" action={formAction}>
                <fieldset>
                    <h1 className="text-2xl font-bold text-center">Request Invite</h1>

                    <label htmlFor="email" className="fieldset-label">Email</label>
                    <input id="email" name="email" type="email" className="input w-full" required placeholder='user@domain.tld' />


                    <label htmlFor="purpose" className="fieldset-label">Use Type</label>
                    <select id="purpose" name="purpose" required defaultValue="Select Use Type" className="select w-full">
                        <option disabled={true}>Select Use Type</option>
                        <option>Personal</option>
                        <option>Buisness</option>
                        <option>Both</option>
                    </select>

                    <label htmlFor="usecase " className="fieldset-label">Use Case</label>
                    <textarea id="use_case" name="use_case" className="textarea w-full" placeholder="Your Use Case">

                    </textarea>

                    {(state.alert == "success") ?
                        <div role="alert" className={state.css + " alert mt-8"}>
                            <span>{state.message}</span>
                        </div>
                        : null}
                    {(state.alert == "failure") ?
                        <div role="alert" className={state.css + " alert mt-8"}>
                            <span>{state.message}</span>
                        </div>
                        : null}

                    <div className='align-middle flex flex-col justify-between pt-6 gap-2'>
                        <button type="submit" className="btn btn-accent">Submit Request</button>
                        <Link href={"/dashboard/login"} className="btn btn-accent btn-outline w-full"> Back to Sign in page</Link>
                    </div>
                </fieldset>
            </form>
        </div>
    )
}