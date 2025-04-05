import Link from "next/link";

export default function Sidebar() {
    return (
        <ul className="menu bg-base-200 rounded-box w-56">
            <li><Link href={"/dashboard"}>VMs</Link></li>
            <li><Link href={"/dashboard"}>Firewall</Link></li>
            <li><Link href={"/dashboard"}>Account</Link></li>
            <li><Link href={"/dashboard"}>Billing</Link></li>
            <li><Link href={"/dashboard"}>Support</Link></li>
            <li><Link href={"/dashboard"}>Settings</Link></li>
        </ul>
    )
}
