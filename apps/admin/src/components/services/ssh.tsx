import type { Ssh_keys } from "database";
import {
    AddSSHKeyModalButton,
    AddSSHKeyModalDialog,
    DeleteSSHKeyModalButton,
    DeleteSSHKeyModalDialog
} from "@/components/modals/ssh";
import "../../style/ssh.css"

type sshCardProp = {
    ssh_keys: Ssh_keys[]
    userID: string
}

function mapIdKey(index: number): string {
    return `ssh-key-${index}`;
}

function limit_key_display(key_name: string): string {
    if (key_name.length > 30) {
        return `${key_name.substring(0, 29)}...`
    }
    return key_name.padEnd(30, " ")
}


export function SshCard({ ssh_keys, userID }: sshCardProp) {
    return (
        <div className="card card-border w-full h-fit">
            <div className="card-body">
                <h2 className="fieldset-legend">SSH Keys</h2>
                <ul>
                    <li className="ssh-row-header w-full">
                        <div className="ssh-row-name">Key Name</div>
                        <div className="ssh-row-header-action">Action</div>
                    </li>
                    {ssh_keys.map((ssh_key, index) => (
                        <li key={mapIdKey(index)} className="ssh-row w-full">
                            <div className="ssh-row-name pt-2" >{limit_key_display(ssh_key.name)} </div>
                            <div className="pl-8"><DeleteSSHKeyModalButton className="btn btn-neutral join-item" btn_name="Delete" ssh_key={ssh_key} index={index} /></div>
                            <DeleteSSHKeyModalDialog ssh_key={ssh_key} index={index} />
                        </li>
                    ))}
                </ul>
                <AddSSHKeyModalButton className="btn btn-accent join-item" btn_name="New SSH Key" />
                <AddSSHKeyModalDialog />
            </div>
        </div>
    )
}