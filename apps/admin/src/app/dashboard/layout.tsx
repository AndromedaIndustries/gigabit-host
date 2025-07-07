import Sidebar from "@/components/navigation/sidebar";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabaseClent = await createClient();

    const user = (await supabaseClent.auth.getUser()).data.user;

    return (
        <div className="flex md:flex-row">
            {(user !== null) ? (
                <div className="flex-1/6">
                    <div className="hidden md:flex fixed md:w-1/6 mt-16 h-screen bg-base-200">
                        {Sidebar()}
                    </div>
                </div>
            ) : null}

            <div className="bg-base-100 flex-5/6">
                {children}
            </div>
        </div >
    );
}

