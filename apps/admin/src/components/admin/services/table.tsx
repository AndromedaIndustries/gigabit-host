import { GetSku } from "@/components/services/vms/vmHelpers";
import { VmMetadata } from "@/types/vmMetadata";
import { Services, prisma } from "database";

export async function ServicesTable({ services }: { services: Services[]; }) {

    return (
        <table className="table table-zebra w-full">
            <ServiceHeader />

            <tbody>
                {services.map((service, pos) => (
                    <ServiceItem key={pos} service={service} />
                ))}
            </tbody>
        </table>
    )

}

async function ServiceHeader() {
    return (
        <thead >
            <tr>
                <th>Hostname</th>
                <th>Sku</th>
                <th>Service Active</th>
                <th>Subscription Active</th>
                <th>IPv4 Address</th>
                <th>IPv6 Address</th>
            </tr>
        </thead>
    );
}

async function ServiceItem({ service }: { service: Services }) {

    async function onClick() {
        "use server"
    }

    const serviceMetadata = service.metadata as VmMetadata

    const sku = await GetSku(service.sku_id)
    return (
        <tr>
            <td>{service.hostname}</td>
            <td>{sku?.name}</td>
            <td>{service.service_active ? "Active" : "Cancled"} </td>
            <td>{service.subscription_active ? "Active" : "Cancled"}</td>
            <td>{serviceMetadata.ipv4_address}</td>
            <td>{serviceMetadata.ipv6_address}</td>
        </tr>
    )
}