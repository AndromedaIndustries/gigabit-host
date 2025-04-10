import os
from proxmoxer import ProxmoxAPI


def get_proxmox_client() -> ProxmoxAPI:
    proxmox_address: str = os.environ.get("PROXMOX_ADDRESS")
    proxmox_user: str = os.environ.get("PROXMOX_USER")
    proxmox_token_name: str = os.environ.get("PROXMOX_TOKEN_NAME")
    proxmox_token_secret: str = os.environ.get("PROXMOX_TOKEN_SECRET")

    if not proxmox_address:
        raise ValueError("PROXMOX_HOST is not set")

    if not proxmox_user:
        raise ValueError("PROXMOX_USER is not set")

    if not proxmox_token_name:
        raise ValueError("PROXMOX_TOKEN_NAME is not set")

    if not proxmox_token_secret:
        raise ValueError("PROXMOX_TOKEN_SECRET is not set")

    proxmox: ProxmoxAPI = ProxmoxAPI(
        host=proxmox_address,
        token_name=proxmox_token_name,
        token_value=proxmox_token_secret,
        user=proxmox_user,
    )

    return proxmox
