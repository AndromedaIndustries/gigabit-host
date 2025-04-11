import { Client, Connection } from "@temporalio/client";

export default async function createTemporalClient() {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const temporal_address = process.env.TEMPORAL_ADDRESS || "localhost:7233";
  const connectionOptions = {
    address: temporal_address,
  };

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const proxmox_namespace: string = process.env.PROXMOX_NAMESPACE || "default";

  // Create a connection to the Temporal server
  const connection = await Connection.connect(connectionOptions);

  // Create a Temporal client
  const client = new Client({
    connection,
    namespace: proxmox_namespace,
  });

  return client;
}
