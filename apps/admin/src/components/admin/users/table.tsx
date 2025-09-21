
import { userMetadata } from "@/types/userMetadata";
import { User } from "@supabase/supabase-js";
import { prisma } from "database";

export async function UsersTable({ users }: { users: User[]; }) {

    return (
        <table className="table table-zebra w-full">
            <UserHeader />

            <tbody>
                {users.map((user, pos) => (
                    <UserItem key={pos} user={user} />
                ))}
            </tbody>
        </table>
    )

}

async function UserHeader() {
    return (
        <thead >
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Purpose</th>
                <th>Services</th>
            </tr>
        </thead>
    );
}

async function UserItem({ user }: { user: User }) {

    async function onClick() {
        "use server"
    }

    const user_metadata = user.user_metadata as userMetadata

    const service_count = await prisma.services.count({
        where: {
            user_id: user.id,
            service_active: true,
        }
    })

    var first_name = user_metadata.first_name
    var last_name = user_metadata.last_name

    if (first_name == undefined) {
        first_name = ""
    }

    if (last_name == undefined) {
        last_name = ""
    }

    return (
        <tr>
            <td>{user.id}</td>
            <td>{user.email}</td>
            <td>{first_name + " " + last_name} </td>
            <td>{user_metadata.account_type}</td>
            <td>{service_count}</td>
        </tr>
    )
}