import Sidebar from "@/components/navigation/sidebar";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabaseClent = await createClient();

    const user = (await supabaseClent.auth.getUser()).data.user;

    if (!user) {
        console.log("No user found");
    }

    return (
        <div className="flex md:flex-row">
            <div className="hidden md:flex fixed md:w-1/6 mt-16 h-screen bg-base-200">
                {Sidebar()}
            </div>
            <div className="flex-1/6">

            </div>
            <div className="bg-base-100 pt-20 px-10 pb-24 flex-5/6">
                {children}
            </div>
        </div >
    );
}
