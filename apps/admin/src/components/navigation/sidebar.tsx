import Link from "next/link";

export default function Sidebar() {
    return (

        <ul className="menu bg-base-200 rounded-box p-2 fixed">
            <li><Link href={"/dashboard"}>Dashboard</Link></li>
            <li><Link href={"/dashboard/vm"}>VMs</Link></li>
            <li><Link href={"/dashboard/billing"}>Billing</Link></li>
            <li><Link href={"/dashboard/settings"}>Settings</Link></li>
        </ul>
    )
}
