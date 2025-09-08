import { updatePassword } from "./actions/update";

export function UpdatePasswordForm() {

    return (
        <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center" action={updatePassword}>
            <fieldset>
                <h1 className="text-2xl font-bold text-center">Update your password</h1>

                <label htmlFor="password" className="fieldset-label">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="input w-full"
                    required
                    placeholder="Password"
                    minLength={8}
                    pattern=".{12,}"
                    title="Must be more than 12 characters"
                />

                <p className="validator-hint hidden">Must be more than 12 characters</p>
                <div className='align-middle flex flex-col justify-between pt-6'>
                    <button type="submit" className="btn btn-outline btn-primary" >Update Password</button>
                </div>
            </fieldset>
        </form>
    );
}