import AdminSidebar from "@/components/navigation/adminSideBar";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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




    if (siteAdmin) {
        return (
            <div className="flex md:flex-row">
                {(user !== null) ? (
                    <div className="flex-1/8">
                        <div className="hidden md:flex fixed md:w-1/8 mt-16 h-screen bg-base-200">
                            {AdminSidebar()}
                        </div>
                    </div>
                ) : null}

                <div className="bg-base-100 flex-7/8">
                    {children}
                </div>
            </div >
        );
    }

    redirect("/dashboard")
}

