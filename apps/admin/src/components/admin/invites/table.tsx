import { faMailForward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InviteRequest } from "database";
import { SendInvite } from "./actions/sendInvite";

export async function InvitesTable({ invites }: { invites: InviteRequest[] }) {

    return (
        <table className="table table-zebra w-full">
            <InviteHeader />

            <tbody>
                {invites.map((invite, pos) => (
                    <InviteItem key={pos} invite={invite} />
                ))}
            </tbody>
        </table>
    )

}

async function InviteHeader() {
    return (
        <thead >
            <tr>
                <th>Request Date</th>
                <th>Email</th>
                <th>Purpose</th>
                <th>Use</th>
                <th>Send Date</th>
                <th>User ID</th>
                <th>Actions</th>
            </tr>
        </thead>
    );
}

async function InviteItem({ invite }: { invite: InviteRequest }) {

    async function onClick() {
        "use server"
        await SendInvite(invite.id)
    }

    return (
        <tr>
            <td>{invite.created_at.toLocaleDateString()}</td>
            <td>{invite.email}</td>
            <td>{invite.purpose}</td>
            <td>{invite.use}</td>
            <td>{invite.sent_at?.toLocaleDateString()}</td>
            <td>{invite.user_id}</td>
            <td>
                {(!invite.sent_at) ?
                    <button onClick={onClick}>
                        <FontAwesomeIcon icon={faMailForward} />
                    </button> : null}
            </td>

        </tr>
    )
}