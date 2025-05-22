import { Client, Connection } from "@temporalio/client";

export default async function createTemporalClient() {
  const temporal_address =
    process.env.NEXT_PUBLIC_TEMPORAL_SERVER || "localhost:7233";

  console.log("Temporal address:", temporal_address);

  const connectionOptions = {
    address: temporal_address,
    // timeout of 30 seconds
    connectionTimeout: 30000,
  };

  const proxmox_namespace: string =
    process.env.NEXT_PUBLIC_PROXMOX_NAMESPACE || "default";

  // Create a connection to the Temporal server
  const connection = await Connection.connect(connectionOptions);

  // Check if the connection was successful
  if (!connection) {
    throw new Error("Failed to connect to Temporal server");
  }
  console.log("Connected to Temporal server at", temporal_address);

  // Create a Temporal client
  const client = new Client({
    connection,
    namespace: proxmox_namespace,
  });

  return client;
}
