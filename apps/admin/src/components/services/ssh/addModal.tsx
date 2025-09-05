"use client";

import { NewSshKey } from "./actions/new";

export function SsshKeyModalButton() {
    function openModal() {
        const modal = document.getElementById("ssh_key_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }

    return (
        <div className="grid grid-cols-1 w-full">
            <AddSSHKeyModalDialog />
            <button type="button" onClick={openModal} className="btn btn-accent w-40">New SSH Key</button>
        </div>
    )

}

export function AddSSHKeyModalDialog() {

    const handleAction = async (formData: FormData) => {
        NewSshKey(formData)

        const modal = document.getElementById("ssh_key_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.close()
        }

    }

    return (
        <div>
            <dialog id="ssh_key_modal" className="modal">
                <div className="modal-box border border-accent">
                    <form action={handleAction}>
                        <fieldset className="fieldset rounded-box justify-center">
                            <div className="fieldset-label">
                                New Public SSH Key
                            </div>
                            <textarea
                                name="public_key"
                                className="textarea w-full validator"
                                placeholder="Enter your SSH Public key..."
                                required
                            />
                            <p className="validator-hint">Required</p>
                            <label htmlFor="name-input-field" className="fieldset-label">
                                Name
                            </label>
                            <input
                                id="name-input-field"
                                name="name"
                                type="text"
                                className="input w-full validator"
                                placeholder="Enter a name for this key..."
                                required
                            />
                            <p className="validator-hint">Required</p>
                            <div>
                                <button type="submit" className="modal-action btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="button" >close</button>
                </form>
            </dialog>
        </div>
    )
}