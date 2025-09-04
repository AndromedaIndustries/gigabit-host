export interface VmMetadata {
    initial_sku: string;
    initial_price: string;          // note: quoted number → string
    ipv4_address: string;
    ipv4_address_id: string;
    ipv6_address: string;
    ipv6_address_id: string;
}