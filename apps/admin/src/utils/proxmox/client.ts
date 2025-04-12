import proxmoxApi from "proxmox-api";

export async function proxmoxClient() {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const proxmox_user = process.env.PROXMOX_USER;

  if (!proxmox_user) {
    throw new Error("PROXMOX_USER is not defined");
  }
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const proxmox_address = process.env.PROXMOX_ADDRESS;

  if (!proxmox_address) {
    throw new Error("PROXMOX_ADDRESS is not defined");
  }
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const proxmox_token_name = process.env.PROXMOX_TOKEN_NAME;

  if (!proxmox_token_name) {
    throw new Error("PROXMOX_USER is not defined");
  }
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const proxmox_token_secret = process.env.PROXMOX_TOKEN_SECRET;

  if (!proxmox_token_secret) {
    throw new Error("PROXMOX_USER is not defined");
  }

  const tokenID = `${proxmox_user}!${proxmox_token_name}`;

  // connect to proxmox
  const proxmox = proxmoxApi({
    host: proxmox_address,
    tokenID: tokenID,
    tokenSecret: proxmox_token_secret,
  });

  return proxmox;
}
