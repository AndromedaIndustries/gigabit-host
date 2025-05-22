import { Client, Connection } from "@temporalio/client";

export default async function createTemporalClient() {
  const temporal_address =
    process.env.NEXT_PUBLIC_TEMPORAL_ADDRESS || "localhost:7233";
  const connectionOptions = {
    address: temporal_address,
  };

  const proxmox_namespace: string =
    process.env.NEXT_PUBLIC_PROXMOX_NAMESPACE || "default";

  // Create a connection to the Temporal server
  const connection = await Connection.connect(connectionOptions);

  // Create a Temporal client
  const client = new Client({
    connection,
    namespace: proxmox_namespace,
  });

  return client;
}
