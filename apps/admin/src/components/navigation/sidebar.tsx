import Link from "next/link";

export default function Sidebar() {
    return (
        <ul className="menu bg-base-200 rounded-box w-56 fixed">
            <li><Link href={"/vm"}>VMs</Link></li>
            {/* <li><Link href={"/firewall"}>Firewall</Link></li> */}
            {/* <li><Link href={"/account"}>Account</Link></li> */}
            <li><Link href={"/billing"}>Billing</Link></li>
            {/* <li><Link href={"/support"}>Support</Link></li> */}
            <li><Link href={"/settings"}>Settings</Link></li>
        </ul>
    )
}
