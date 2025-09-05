import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { prisma, type Ssh_keys } from "database";
import { revalidatePath } from "next/cache";

export async function SshTable({ ssh_keys }: { ssh_keys: Ssh_keys[] }) {

    return (
        <table className="table">
            <thead>
                <tr>
                    <td>Key Name</td>
                    <td>Key</td>
                    <td>Action</td>
                </tr>
            </thead>
            <tbody>
                {ssh_keys.map((key, index) => (
                    <SshTableRow ssh_key={key} key={index} />
                ))}
            </tbody>
        </table>
    )
}

async function SshTableRow({ ssh_key }: { ssh_key: Ssh_keys }) {

    async function deleteKey() {
        "use server"
        await prisma.ssh_keys.delete({
            where: {
                id: ssh_key.id
            }
        })

        revalidatePath("/dashboard/settings")
    }
    var public_key = ssh_key.public_key

    if (public_key.match("ssh-ed25519")) {
        public_key = public_key.replace("ssh-ed25519", "")
    }
    if (public_key.match("ssh-rsa")) {
        public_key = public_key.replace("ssh-rsa", "")
    }

    return (
        <tr>
            <td>{ssh_key.name}</td>
            <td>{public_key.substring(0, 17)}</td>
            <td><button onClick={deleteKey}>
                <FontAwesomeIcon icon={faXmark} className="text-error" />
            </button></td>
        </tr>
    )
}

