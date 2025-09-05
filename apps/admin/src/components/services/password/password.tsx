"use client";
import { useState } from 'react'
import { updatePassword } from './actions/update';

export function OpenPasswordModalButton({ customCss }: { customCss: string }) {
    function openModal() {
        const modal = document.getElementById("password_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }

    var buttonCss = "btn btn-accent " + customCss

    return (
        <button type="button" onClick={openModal} className={buttonCss}>Update Password</button>
    )
}


export function UpdatePasswordModal() {
    const [password, setPassword] = useState('')

    return (
        <dialog id="password_modal" className="modal">
            <div className="modal-box">
                <form onSubmit={() => updatePassword(password)}>
                    <fieldset className="fieldset bg-base-200 p-4 rounded-box">
                        <legend className="fieldset-legend">Update Password</legend>
                        <label htmlFor="password" className="fieldset-label">New Password</label>
                        <input
                            required
                            id="password"
                            name="new_password"
                            type="password"
                            className="input w-full"
                            onChange={(e) => setPassword(e.target.value)}
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