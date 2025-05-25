import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    if (!user_id) {
        redirect("/dashboard/login");
    } else {
        redirect("/dashboard");
    }
}