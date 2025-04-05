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
        <div className="flex md:flex-row ">
            <div className="hidden lg:flex lg:w-60 pt-16 h-screen bg-base-200">
                <div className="p-2">
                    {Sidebar()}
                </div>

            </div >
            <div className="bg-base-100 flex-grow min-h-dvh b-48 pt-16">
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div >
    );
}
