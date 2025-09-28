"use server";
import { Client, Connection, ConnectionOptions } from "@temporalio/client";

export default async function createTemporalClient() {
  const environment = process.env.ENV;
  const temporal_address =
    process.env.TEMPORAL_SERVER || "localhost:7233";

  const temporal_namespace = process.env.TEMPORAL_NAMESPACE
  const temporal_account_id = process.env.TEMPORAL_ACCOUNT_ID
  const temporal_api_key = process.env.TEMPORAL_API_KEY
  let connectionOptions: ConnectionOptions;

  if (environment == "DEV") {
    connectionOptions = {
      address: temporal_address,
      // timeout of 30 seconds
      connectTimeout: 30000,
    };
  } else {
    connectionOptions = {
      address: temporal_address,
      tls: true,
      apiKey: temporal_api_key,
      // timeout of 30 seconds
      connectTimeout: 30000,
    };
  }

  // Create a connection to the Temporal server
  const connection = await Connection.connect(connectionOptions);

  // Check if the connection was successful
  if (!connection) {
    throw new Error("Failed to connect to Temporal server");
  }

  let client

  if (environment == "DEV") {
    client = new Client({
      connection,
      namespace: temporal_namespace,
    });
  } else {
    // Create a Temporal client
    client = new Client({
      connection,
      namespace: temporal_namespace + "." + temporal_account_id,
    });
  }

  return client;
}

