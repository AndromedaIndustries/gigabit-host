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
    limit_key_display: Function
}

export function SshCard({ ssh_keys, userID, limit_key_display }: sshCardProp) {
    return (
        <div className="card card-border w-full">
            <div className="card-body">
                <h2 className="fieldset-legend">SSH Keys</h2>
                <ul>
                    {ssh_keys.map((ssh_key, index) => (
                        <li key={index} className="table-row w-full">
                            <div className="table-cell pt-3" >{limit_key_display(ssh_key.name)} </div>
                            <div className="table-cell justify-right pl-8"><DeleteSSHKeyModalButton className="btn btn-neutral join-item" btn_name="Delete" ssh_key={ssh_key} index={index} /></div>
                            <DeleteSSHKeyModalDialog ssh_key={ssh_key} index={index}/>
                        </li>
                    ))}
                </ul>
                <AddSSHKeyModalButton className="btn btn-primary join-item" btn_name="New SSH Key" />
                <AddSSHKeyModalDialog userID={userID} />
            </div>
        </div>
    )
}