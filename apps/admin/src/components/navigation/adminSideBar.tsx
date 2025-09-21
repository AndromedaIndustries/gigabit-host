import Link from "next/link";

export default function AdminSidebar() {

    return (
        <div className="grid grid-cols-1 gap-2 menu bg-base-200 rounded-box p-2 sm:w-1/8 fixed">
            <div className="mt-5 place-self-center">Admin Portal</div>
            <ul className="list">
                <li><Link href={"/admin/users"}>Users</Link></li>
                <li><Link href={"/admin/services"}>Services</Link></li>

                <li><Link href={"/admin/invites"}>Invites</Link></li>
                <li><Link href={"/dashboard"}>Back to Dashboard</Link></li>
            </ul>
        </div>
    )
}
