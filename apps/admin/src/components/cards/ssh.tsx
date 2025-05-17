import type { Ssh_keys } from "database";
import {
    AddSSHKeyModalButton,
    AddSSHKeyModalDialog,
    DeleteSSHKeyModalButton,
    DeleteSSHKeyModalDialog
} from "@/components/modals/ssh";

type sshCardProp = {
    ssh_keys: Ssh_keys[]
    userID: string | undefined
}

export function SshCard({ ssh_keys, userID }: sshCardProp) {
    //TODO(twodarek): make sure this actually passes the correct ssh key to the model for delete
    //                currently, it always shows up with the first ssh key

    return (
        <div className="card card-border bg-base-300 w-64 h-64">
            <div className="card-body items-center text-center">
                <h2 className="card-title">SSH Keys</h2>
                <ul>
                    {ssh_keys.map((ssh_key, index) => (
                        <li key={index} className="list-row w-full">
                            {ssh_key.name}
                            <DeleteSSHKeyModalButton className="btn btn-neutral join-item" btn_name="Delete" ssh_key={ssh_key} />
                            <DeleteSSHKeyModalDialog ssh_key={ssh_key} />
                        </li>
                    ))}
                </ul>
                <AddSSHKeyModalButton className="btn btn-primary join-item" btn_name="New SSH Key" />
                <AddSSHKeyModalDialog userID={userID} />
            </div>
        </div>
    )
}