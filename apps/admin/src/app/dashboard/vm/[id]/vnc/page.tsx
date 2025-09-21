import VncTerminal from '@/components/services/vm/terminal/vnc/terminal';
import { createClient } from '@/utils/supabase/server';
import { prisma } from "database"

type sessionRequest = {
    session_id: number;
    status: string;
    password: string;
};


export default async function VncViewer({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const proxmoxServer = process.env.PROXMOX_ADDRESS

    if (!proxmoxServer) {
        throw new Error("Proxmox Server Not Set")
    }

    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const userSession = (await supabase.auth.getSession()).data.session;
    const user_id = userObject.data.user?.id;

    if (typeof user_id == "undefined") {
        throw new Error("User not found")
    }

    if (userSession == null) {
        throw new Error("User Session not found")
    }

    const vm = await prisma.services.findUnique({
        where: {
            id: (await params).id
        }
    })

    if (!vm) {
        throw new Error("Failed to retrieve VM")
    }

    const sessionParams = {
        service_id: vm.id,
        user_id: vm.user_id,
    };

    const sessionRequestURL = `https://${proxmoxServer}/api/request/session/id`

    const res = await fetch(sessionRequestURL, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userSession.access_token,
        },
        body: JSON.stringify(sessionParams),
    });; // Or a relative path
    const session: sessionRequest = await res.json();

    if (session == undefined) {
        throw new Error("Session is undefined")
    }

    const ws_url = `wss://${proxmoxServer}/ws?session_id=${session.session_id}&token=${userSession.access_token}`

    return (
        <div className="w-full pt-20 px-10 pl-48 grid grid-cols-2">
            <div>
                <VncTerminal url={ws_url} vncPassword={session.password} />
            </div>

        </div>
    )
}
