import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Sidebar() {

    const supabaseClent = await createClient();
    const userObject = await supabaseClent.auth.getUser();
    const user = userObject.data.user || null;

    const role = await prisma.role.findFirst({
        where: {
            name: "site-admin"
        }

    })

    if (user == null || role == null) {
        redirect("/dashboard")
    }

    const userPermissions = await prisma.permissions.findMany({
        where: {
            userId: user.id
        }
    })

    const siteAdmin = userPermissions.find((permission) => permission.roleId == role.id) ? true : false


    return (
        <div className="menu bg-base-200 rounded-box p-2 fixed">
            <ul className="list">
                <li><Link href={"/dashboard"}>Dashboard</Link></li>
                <li><Link href={"/dashboard/vm"}>VMs</Link></li>
                <li><Link href={"/dashboard/billing"}>Billing</Link></li>
                <li><Link href={"/dashboard/settings"}>Settings</Link></li>
                {(siteAdmin) ? (
                    <li><Link href={"/admin"}>Admin Portal</Link></li>
                ) : null}
            </ul>
        </div>
    )
}
