"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        async function signOut() {
            const supabase = await createClient();
            await supabase.auth.signOut();
            router.push("/login");
        }
        signOut();
    }, [router]);

    return <div>Logging out...</div>;
}