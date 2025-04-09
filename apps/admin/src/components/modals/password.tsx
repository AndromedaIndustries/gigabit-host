"use client";
import { updatePassword } from "@/utils/auth/updatePasswd";


export function OpenPasswordModal() {
    function openModal() {
        const modal = document.getElementById("password_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }

    return (
        <button type="button" onClick={openModal} className="btn btn-primary">Update Password</button>
    )
}


export function UpdatePasswordModal() {
    return (
        <dialog id="password_modal" className="modal">
            <div className="modal-box">

                <form action={updatePassword}>
                    <fieldset className="fieldset  bg-base-200 p-4 rounded-box">
                        <legend className="fieldset-legend">Update Password</legend>
                        <label htmlFor="password" className="fieldset-label">New Password</label>
                        <input
                            required
                            id="password"
                            name="new_password"
                            type="password"
                            className="input w-full"
                        />
                        <div className='align-middle flex flex-col justify-between pt-6'>
                            <button type="submit" className="btn btn-warning">Update Password</button>
                        </div>
                    </fieldset>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}