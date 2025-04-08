import Link from "next/link";

export default function Sidebar() {
    return (
        <ul className="menu bg-base-200 rounded-box w-56">
            <li><Link href={"/dashboard/vm"}>VMs</Link></li>
            {/* <li><Link href={"/dashboard/firewall"}>Firewall</Link></li> */}
            {/* <li><Link href={"/dashboard/account"}>Account</Link></li> */}
            <li><Link href={"/dashboard/billing"}>Billing</Link></li>
            {/* <li><Link href={"/dashboard/support"}>Support</Link></li> */}
            <li><Link href={"/dashboard/settings"}>Settings</Link></li>
        </ul>
    )
}
