from proxmoxer import ProxmoxAPI
from proxmox.client import get_proxmox_client
from database.client import get_supabase_client
from supabase import Client
from temporalio import activity


@activity.defn
async def resize_proxmox_vm() -> bool:

    proxmox: ProxmoxAPI = get_proxmox_client()
    dbClient: Client = get_supabase_client()
