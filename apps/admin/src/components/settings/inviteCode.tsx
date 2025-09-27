"use client";

export default function InviteCodeCard({ invite_code }: { invite_code: string }) {

    const invite_code_elment_id = "invite_code"

    function copyText(): void {
        const textElement = document.getElementById(invite_code_elment_id);
        if (textElement) {
            const textToCopy = textElement.innerText;
            navigator.clipboard.writeText(textToCopy)
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    }

    return (
        <div className="card w-lg bg-base-200 border-base-300">
            <div className="card-body">
                <div className="card-title"> Personal Invite Code</div>
                <div className="tooltip" data-tip="Click to Copy">
                    <button id={invite_code_elment_id} className="link link-success" onClick={copyText}>
                        https://portal.gigabit.host/invite?code={invite_code}
                    </button>
                </div>
            </div>
        </div>
    )
}
