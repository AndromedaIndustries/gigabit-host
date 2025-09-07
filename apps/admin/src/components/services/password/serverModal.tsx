import { updatePassword } from "./actions/update";

export function UpdatePasswordModal() {

    return (
        <dialog id="password_modal" className="modal">
            <div className="modal-box">
                <form action={updatePassword}>
                    <fieldset className="fieldset bg-base-200 p-4 rounded-box">
                        <legend className="fieldset-legend">Update Password</legend>
                        <label htmlFor="password" className="fieldset-label">New Password</label>
                        <input
                            required
                            id="password"
                            name="new_password"
                            type="password"
                            className="input w-full"
                        />
                        <div className='flex flex-row place-content-end pt-6 w-full'>
                            <button type="submit" className="btn btn-warning">
                                Submit
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog >
    );
}