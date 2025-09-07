"use client";

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