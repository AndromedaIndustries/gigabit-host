import Link from "next/link";

export default function AdminSidebar() {

    return (

        <ul className="menu bg-base-200 rounded-box p-2 fixed">
            <li><Link href={"/dashboard"}>Back to Dashboard</Link></li>
        </ul>
    )
}
