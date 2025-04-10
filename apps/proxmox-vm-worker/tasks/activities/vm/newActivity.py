from proxmoxer import ProxmoxAPI
from proxmox.client import get_proxmox_client
from database.client import get_supabase_client
from supabase import Client
from temporalio import activity
from types.service import Service


@activity.defn
async def new_proxmox_vm(userID: str, serviceID: str) -> bool:

    proxmox: ProxmoxAPI = get_proxmox_client()
    dbClient: Client = get_supabase_client()

    # Get the VM from the database
    vm = (
        dbClient.table("services")
        .select("*")
        .eq("subscription_active", True)
        .eq("service_id", serviceID)
        .eq("user_id", userID)
        .execute()
    )

    if vm.count is None:
        return False

    if vm.count > 1:
        raise ValueError(
            "Multiple services found for the given user {userID} and service {serviceID}"
        )

    vmObject = Service(**vm)

    # Create a data object to pass the proxmox API client
    proxmoxOptions = {}

    #
