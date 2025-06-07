"use client";

export function OpenNewVmModal() {
    function openModal() {
        const modal = document.getElementById("new_vm_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }

    return (
        <button type="button" onClick={openModal} className="btn btn-primary">New VM</button>
    )
}
