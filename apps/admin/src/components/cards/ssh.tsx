import type { Ssh_keys } from "database";
import Link from "next/link";

type sshCardProp = {
    ssh_keys: Ssh_keys[]
}

export function SshCard({ ssh_keys }: sshCardProp) {

    return (
        <div className="card card-border bg-base-300 w-64 h-64">
            <div className="card-body items-center text-center">
                <h2 className="card-title">SSH Keys</h2>
                <ul>
                    {ssh_keys.map((ssh_key, index) => (
                        <li key={index}>{ssh_key.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}