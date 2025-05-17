"use client";
import { prisma, type Ssh_keys } from "database";
import { Router } from "next/router";
import { useState, useEffect, use } from "react";


type ssh_key_modal_props = {
    userID?: string;
    className?: string;
    btn_name?: string;
}

type ListSSHKeysProps = {
    id?: string;
    ssh_keys: Ssh_keys[];
};

type delete_key_model_props = {
    className?: string;
    btn_name?: string;
    ssh_key: Ssh_keys;
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

export function AddSSHKeyModalDialog({ userID }: ssh_key_modal_props) {

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
                            <label htmlFor="newSSHKey" className="fieldset-label">
                                New Public SSH Key
                            </label>
                            <textarea
                                name="public_key"
                                className="textarea w-full validator"
                                placeholder="Enter your SSH Public key..."
                                required
                            />
                            <p className="validator-hint">Required</p>
                            <label htmlFor="name" className="fieldset-label">
                                Name
                            </label>
                            <input
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

export function DeleteSSHKeyModalButton({ className, btn_name, ssh_key }: delete_key_model_props) {

    function openModal() {
        const modal = document.getElementById("delete_ssh_key_modal") as HTMLDialogElement | null;

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

export function DeleteSSHKeyModalDialog({ ssh_key }: delete_key_model_props) {

    function closeModal() {
        const modal = document.getElementById("delete_ssh_key_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.close();
        }
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
            <dialog id="delete_ssh_key_modal" className="modal">
                <form onSubmit={confirmDelete}>
                    <fieldset className="fieldset rounded-box justify-center">
                        <div className="modal-box border border-accent">
                            <legend className="fieldset-legend">
                                Are you sure you&#39;d like to delete this public key?
                                This action will NOT remove the public key from your VMs
                            </legend>
                            <div className="flex flex-row pt-4 justify-center">
                                <label htmlFor="deleteSSHKey" className="justify-between">
                                    Public SSH Key Name:
                                </label>
                                <input
                                    name="public_key"
                                    type="text"
                                    className="textfield validator text-primary"
                                    value={ssh_key.name}
                                    required
                                    disabled
                                    readOnly
                                />
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
                                        onClick={closeModal}>No</button>
                            </div>
                        </div>
                    </fieldset>
                </form>
                <form method="dialog" className="modal-backdrop">
                    <button type="button" onClick={closeModal}>Close</button>
                </form>
            </dialog>
        </div>
    )
}