"use client";
import type { Ssh_keys } from "database";
import { Router } from "next/router";


type ssh_key_modal_props = {
    userID?: string;
    className?: string;
    btn_name?: string;
}

type ListSSHKeysProps = {
    id?: string;
    ssh_keys: Ssh_keys[];
};

type delete_key_modal_props = {
    className?: string;
    ssh_key: Ssh_keys;
    index: number;
}

type delete_key_button_props = {
    className?: string;
    btn_name?: string;
    ssh_key: Ssh_keys;
    index: number;
}

export function ListSSHModalKeys({ ssh_keys, id }: ListSSHKeysProps) {

    if (ssh_keys.length === 0) {
        return (
            <div className="join">
                <select id={id} name={id} className="select select-bordered w-full" defaultValue="">
                    <option disabled value="">No SSH Keys - Please Click New</option>
                </select>
                <AddSSHKeyModalButton className="btn btn-neutral join-item" btn_name="New" />
            </div>
        )
    }

    return (
        <div className="join">
            <select id={id} name={id} className="select select-bordered w-full">
                {ssh_keys.map((sshKey) => (
                    <option key={sshKey.id} value={sshKey.id} className="flex flex-col">
                        {sshKey.name}
                    </option>
                ))}
            </ select>
            <AddSSHKeyModalButton className="btn btn-neutral join-item" btn_name="New" />
        </div>
    );
}


export function AddSSHKeyModalButton({ className, btn_name }: ssh_key_modal_props) {

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
        <button type="button" onClick={openModal} className={className}>
            {btn_name}
        </button>
    );
}

export function AddSSHKeyModalDialog() {

    function closeModal() {
        const modal = document.getElementById("ssh_key_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.close();
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // call api to create ssh key
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch("/api/settings/ssh", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.status === 201) {
                closeModal();
                Router.prototype.reload();
            };
        }
        ).catch((error) => {
            console.log("Error adding SSH key:", error);
        });
    };

    return (
        <div>
            <dialog id="ssh_key_modal" className="modal">
                <div className="modal-box border border-accent">
                    <form onSubmit={handleSubmit}>
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
                    <button type="button" onClick={closeModal}>close</button>
                </form>
            </dialog>
        </div>
    )
}

export function DeleteSSHKeyModalButton({ className, btn_name, index }: delete_key_button_props) {

    function openModal() {
        const modal = document.getElementById(`delete_ssh_key_modal${index}`) as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }
    return (
        <button type="button" onClick={openModal} className={className}>
            {btn_name}
        </button>
    );
}

export function DeleteSSHKeyModalDialog({ ssh_key, index }: delete_key_modal_props) {
    console.log("OHAI2!!!!", ssh_key)

    function closeModal() {
        const modal = document.getElementById(`delete_ssh_key_modal${index}`) as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.close();
        }
    }

    function getDialogId() {
        return `delete_ssh_key_modal${index}`
    }

    const confirmDelete = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // call api to create ssh key
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch("/api/settings/ssh", {
            method: "DELETE",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.status === 201) {
                closeModal();
                Router.prototype.reload();
            };
        }
        ).catch((error) => {
            console.log("Error deleting SSH key:", error);
        });
    };

    return (
        <div>
            <dialog id={getDialogId()} className="modal">
                <div className="modal-box">
                    <form onSubmit={confirmDelete}>
                        <fieldset className="fieldset rounded-box justify-center">
                            <div className="modal-box border border-accent w-full">
                                <legend className="fieldset-legend">
                                    Are you sure you&#39;d like to delete this public key?
                                    This action will NOT remove the public key from your VMs
                                </legend>
                                <div className="flex flex-col w-full pt-4 items-center">
                                    <div>Public SSH Key Name:</div>
                                    <div className="text-primary">{ssh_key.name}</div>
                                </div>
                                <input
                                    name="ssh_key_id"
                                    type="text"
                                    className="input"
                                    value={ssh_key.id}
                                    required
                                    hidden
                                    readOnly
                                />
                                <p className="validator-hint">Required</p>
                                <div className='justify-center flex flex-row gap-4'>
                                    <button type="submit" className="modal-action btn btn-primary gap-4">Yes</button>
                                    <button type="button" className="modal-action btn btn-secondary"
                                        onClick={closeModal}>No
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="button" onClick={closeModal}>Close</button>
                </form>
            </dialog>
        </div>
    )
}
