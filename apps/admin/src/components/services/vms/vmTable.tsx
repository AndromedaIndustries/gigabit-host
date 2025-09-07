import type { Services } from "database";

import Link from "next/link";
import { GetSku } from "./vmHelpers";
import { VmMetadata } from "@/types/vmMetadata";
import { proxmoxClient } from "@/utils/proxmox/client";


export async function VmTable({ vms }: { vms: Services[] }) {
    return (
        <table className="table table-xs table-pin-rows table-pin-cols">
            <thead>
                <tr>
                    <th>Hostname</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>IPv4 Address</th>
                    <th>IPv6 Address</th>
                    <th>Subscription Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {vms.map((vm) => (
                    <VmRow key={vm.id} vm={vm} />
                ))}
            </tbody>
        </table>
    );
}

export async function VmRow({ vm }: { vm: Services }) {
    const sku = await GetSku(vm.current_sku_id);
    const metadata =
        typeof vm.metadata === 'object' && vm.metadata !== null && !Array.isArray(vm.metadata)
            ? (vm.metadata as VmMetadata)
            : null

    return (
        <tr>
            <td className="text-left">{vm.hostname}</td>
            <td className="text-left">{sku?.sku}</td>
            <td className="text-left">{sku?.price} $/mo</td>
            <td className="text-left">{metadata?.ipv4_address || "IP Pending"}</td>
            <td className="text-left">{metadata?.ipv6_address || "IP Pending"}</td>
            <td className="text-left">
                {vm.subscription_active ? (
                    <div className="badge badge-success badge-sm">Active</div>
                ) : (
                    <div className="badge badge-error badge-sm">Inactive</div>
                )}
            </td>
            <td className="text-left">
                <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-accent btn-sm">
                    Manage
                </Link>
            </td>
        </tr>
    );
}

export async function VmTableShort({ vms }: { vms: Services[] }) {
    return (
        <table className="table table-xs table-pin-rows table-pin-cols">
            <thead>
                <tr>
                    <th>Hostname</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>VM Status</th>
                    <th>Subscription</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {vms.map((vm) => (
                    <VmRowShort key={vm.id} vm={vm} />
                ))}
            </tbody>
        </table>
    );
}

export async function VmRowShort({ vm }: { vm: Services }) {
    const sku = await GetSku(vm.current_sku_id);
    const metadata =
        typeof vm.metadata === 'object' && vm.metadata !== null && !Array.isArray(vm.metadata)
            ? (vm.metadata as VmMetadata)
            : null

    const proxmox = await proxmoxClient()

    const proxmox_node = vm.proxmox_node
    const proxmox_vm_id_string = vm.proxmox_vm_id

    var status = "pending"

    if (proxmox_node && proxmox_vm_id_string) {
        const proxmox_vm_id = parseInt(proxmox_vm_id_string, 10)

        const nodeStatus = await proxmox.nodes.$(proxmox_node).qemu.$(proxmox_vm_id).status.current.$get()

        status = nodeStatus.status
    }

    var statusCell;

    switch (status) {
        case 'running':
            statusCell = <td>
                <div className="badge badge-success badge-sm">Running</div>
            </td>;
            break;
        case 'stopped':
            statusCell = <td>
                <div className="badge badge-error badge-sm">Stopped</div>
            </td>;
            break;
        case 'pending':
            statusCell = <td>
                <div className="badge badge-warning badge-sm">Pending</div>
            </td>;
            break;
        default:
            statusCell = <td></td>;
    }

    return (
        <tr>
            <td className="text-left">{vm.hostname}</td>
            <td className="text-left">{sku?.sku}</td>
            <td className="text-left">{sku?.price} $/mo</td>
            <td className="text-left">
                {vm.subscription_active ? (
                    <div className="badge badge-success badge-sm">Active</div>
                ) : (
                    <div className="badge badge-error badge-sm">Inactive</div>
                )}
            </td>
            {statusCell}
            <td className="text-left">
                <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-accent btn-sm">
                    Manage
                </Link>
            </td>
        </tr>
    );
}