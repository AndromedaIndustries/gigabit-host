import type { Services } from "database";

import Link from "next/link";
import { GetSku } from "./vmHelpers";
import { VmMetadata } from "@/types/vmMetadata";


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

    return (
        <tr>
            <td className="text-left">{vm.hostname}</td>
            <td className="text-left">{sku?.sku}</td>
            <td className="text-left">{sku?.price} $/mo</td>
            <td className="text-left">
                <Link href={`/dashboard/vm/${vm.id}`} className="btn btn-accent btn-sm">
                    Manage
                </Link>
            </td>
        </tr>
    );
}