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
    userID?: string;
    id?: string;
    className?: string;
    ssh_keys: Ssh_keys[];
};


export function ListSSHKeys({ userID, ssh_keys, id, className }: ListSSHKeysProps) {
    const [sshKeys, setSshKeys] = useState<Ssh_keys[]>([]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setSshKeys(ssh_keys);
    }, []);

    function fetchSshKeys() {
        fetch("/api/settings/ssh").then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    setSshKeys(data);
                });
            }
        }).catch((error) => {
            console.log("Error fetching SSH keys:", error);
        });
    }


    if (sshKeys.length === 0) {
        return (
            <div className="join">
                <select id={id} name={id} className="select select-bordered w-full" defaultValue="">
                    <option disabled value="">No SSH Keys - Please Click New</option>
                </select>
                <AddSSHKeyButton className="btn btn-neutral join-item" btn_name="New" />
            </div>
        )
    }

    return (
        <div className="join">
            <select id={id} name={id} className="select select-bordered w-full">
                {sshKeys.map((sshKey) => (
                    <option key={sshKey.id} value={sshKey.id} className="flex flex-col">
                        {sshKey.name}
                    </option>
                ))}
            </ select>
            <AddSSHKeyButton className="btn btn-neutral join-item" btn_name="New" />
        </div>
    );
}


export function AddSSHKeyButton({ className, btn_name }: ssh_key_modal_props) {

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