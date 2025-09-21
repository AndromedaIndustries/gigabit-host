import { VmRebootButton } from '@/components/services/vm/buttons';
import VncTerminal from '@/components/services/vm/terminal/vnc/terminal';
import { proxmoxClient } from '@/utils/proxmox/client';
import { createClient } from '@/utils/supabase/server';
import { prisma } from "database"
import Link from 'next/link';

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
    const proxmoxApiClient = await proxmoxClient();
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

    const proxmoxNode = vm.proxmox_node
    if (proxmoxNode == null) {
        throw new Error("Missing Proxmox Node")
    }

    const proxmoxVmIdString = vm.proxmox_vm_id
    if (proxmoxVmIdString == null) {
        throw new Error("Missing VM ID")
    }
    const proxmoxVmId = parseInt(proxmoxVmIdString, 10)

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
        <div className="w-full h-[calc(100dvh-6rem)] pt-20 px-10 pl-5 flex flex-row">

            <div className="card bg-base-200 flex-1/12 mr-5 h-fit">
                <div className="card-body grid grid-cols-1 w-full justify-items-center">
                    <div>
                        <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-info w-36">
                            Back to VM
                        </Link>
                    </div>
                    <div>
                        <VmRebootButton
                            vm_id={vm.id}
                            proxmox_node={proxmoxNode}
                            proxmox_vm_id={proxmoxVmId}
                        />
                    </div>
                </div>
            </div>

            <div className='flex-9/12 '>
                <VncTerminal url={ws_url} vncPassword={session.password} />
            </div>

        </div>
    )
}
