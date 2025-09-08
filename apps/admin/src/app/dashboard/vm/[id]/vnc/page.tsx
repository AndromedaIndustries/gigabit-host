
import VncTerminalWrapper from '@/components/services/vm/terminal/vnc/VncTerminalWrapper';
import VncTerminal from '@/components/services/vm/terminal/vnc/vnc';
import { proxmoxClient } from "@/utils/proxmox/client"
import { prisma } from "database"

export default async function VncViewer({
    params,
}: {
    params: Promise<{ id: string }>
}) {



    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const proxmox_address = process.env.PROXMOX_ADDRESS;

    if (!proxmox_address) {
        throw new Error("PROXMOX_ADDRESS is not defined");
    }

    const vm = await prisma.services.findUnique({
        where: {
            id: (await params).id
        }
    })

    if (!vm) {
        throw new Error("Failed to retrieve VM")
    }

    const proxmox_node = vm.proxmox_node
    if (!proxmox_node) {
        throw new Error("Failed to retrieve VM proxmox node")
    }
    const proxmox_vm_id_string = vm.proxmox_vm_id
    if (!proxmox_vm_id_string) {
        throw new Error("Failed to retrieve VM proxmox id")
    }
    const proxmox = await proxmoxClient()
    const proxmox_vm_id = parseInt(proxmox_vm_id_string, 10)

    const vncProxy = await proxmox.nodes.$(proxmox_node).qemu.$(proxmox_vm_id).vncproxy.$post({
        websocket: true,
        "generate-password": true
    })

    const vncSession = await proxmox.nodes.$(proxmox_node).qemu.$(proxmox_vm_id).vncwebsocket.$get({
        vncticket: vncProxy.ticket,
        port: vncProxy.port
    })

    return (
        <div>
            <div>
                Connection to Host ${vm.hostname}
            </div>
            <VncTerminal
                node={proxmox_node}
                vm_id={proxmox_vm_id_string}
                port={vncSession.port}
                host={proxmox_address}
                token={vncProxy.ticket}
                password={vncProxy.password || ""}
            />
        </div>
    )
}
