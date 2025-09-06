"use server";
import { Client, Connection } from "@temporalio/client";

export default async function createTemporalClient() {
  const temporal_address =
    process.env.TEMPORAL_SERVER || "localhost:7233";

  const temporal_namespace = process.env.TEMPORAL_NAMESPACE
  const temporal_account_id = process.env.TEMPORAL_ACCOUNT_ID
  const temporal_api_key = process.env.TEMPORAL_API_KEY


  const connectionOptions = {
    address: temporal_address,
    tls: true,
    apiKey: temporal_api_key,
    // timeout of 30 seconds
    connectionTimeout: 30000,
  };

  // Create a connection to the Temporal server
  const connection = await Connection.connect(connectionOptions);

  // Check if the connection was successful
  if (!connection) {
    throw new Error("Failed to connect to Temporal server");
  }

  // Create a Temporal client
  const client = new Client({
    connection,
    namespace: temporal_namespace + "." + temporal_account_id,
  });

  return client;
}

