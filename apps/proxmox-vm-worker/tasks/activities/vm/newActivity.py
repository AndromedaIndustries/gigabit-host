from temporalio import activity
import tldextract
from datetime import datetime
import os
import json


# For creating a new VM
from urllib import parse as urlparse
from proxmoxer.tools import Tasks

# types
from vmTypes.service import Service
from vmTypes.template import ProxmoxTemplates
from vmTypes.sshKey import SshKey
from vmTypes.sku import Sku
from supabase import Client
from proxmoxer import ProxmoxAPI
from proxmox.client import get_proxmox_client
from database.client import get_supabase_client


@activity.defn
async def get_service_from_database(user_id: str, service_id: str) -> Service | bool:

    try:
        dbClient: Client = get_supabase_client()

        print(f"Getting VM {service_id} from the database for user {user_id}")
        # Get the VM from the database
        vm = (
            dbClient.table("Services")
            .select("*")
            .eq("subscription_active", True)
            .eq("id", service_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not vm.data or len(vm.data) == 0:
            print(f"Service {service_id} for user {user_id} not found in the database")
            return False

        if len(vm.data) > 1:
            print(
                f"Multiple services found for the given user {user_id} and service {service_id}"
            )
            raise ValueError(
                f"Multiple services found for the given user {user_id} and service {service_id}"
            )

        vmObject = Service(**vm.data[0])

        if vmObject.status == "provisioned":
            print(f"Service {service_id} for user {user_id} is already provisioned")
            raise ValueError(
                f"Service {service_id} for user {user_id} is already provisioned"
            )

        return vmObject

    except Exception as e:
        print(f"Failed to get VM from database: {e}")
        return False


@activity.defn
async def get_template(vmObject: Service) -> ProxmoxTemplates | bool:

    try:

        dbClient: Client = get_supabase_client()

        print(f"Getting template {vmObject.template_id} from the database")

        # get the template from the database
        template_db_object = (
            dbClient.table("ProxmoxTemplates")
            .select("*")
            .eq("id", vmObject.template_id)
            .execute()
        )

        if not template_db_object.data or len(template_db_object.data) == 0:
            print(f"Template {vmObject.template_id} not found in the database")
            return False
        if len(template_db_object.data) > 1:
            print(
                f"Multiple templates found for the given template {vmObject.template_id}"
            )
            raise ValueError(
                f"Multiple templates found for the given template {vmObject.template_id}"
            )

        # Create a ProxmoxTemplates object
        template = ProxmoxTemplates(**template_db_object.data[0])

        return template

    except Exception as e:
        print(f"Failed to get template from database: {e}")
        return False


@activity.defn
async def get_public_key(user_id: str, vmObject: Service) -> str | bool:
    # Try to get the public key from the database
    try:
        dbClient: Client = get_supabase_client()

        print(
            f"Getting public key {vmObject.public_key_id} from the database for user {user_id}"
        )
        # Get the public key from the database
        public_key = (
            dbClient.table("Ssh_keys")
            .select("*")
            .eq("id", vmObject.public_key_id)
            .execute()
        )

        if not public_key.data or len(public_key.data) == 0:
            print(f"Public key {vmObject.public_key_id} not found in the database")
            return False

        if len(public_key.data) > 1:
            print(
                f"Multiple public keys found for the given public key {vmObject.public_key_id}"
            )
            raise ValueError(
                f"Multiple public keys found for the given public key {vmObject.public_key_id}"
            )

            # Encode the public key
        sshKey = SshKey(**public_key.data[0])
        encoded_ssh_key = urlparse.quote(sshKey.public_key, safe="")
        return encoded_ssh_key

    except Exception as e:
        print(f"Failed to get public key from database: {e}")
        return False


@activity.defn
async def get_next_vm_id() -> int | bool:
    try:

        proxmox: ProxmoxAPI = get_proxmox_client()
        clone_vm_id = int(proxmox.cluster.nextid.get())

        print(f"Next VM ID: {clone_vm_id}")

        return clone_vm_id
    except Exception as e:
        print(f"Failed to get next VM ID: {e}")
        return False


@activity.defn
async def clone_vm(
    vmObject: Service, template: ProxmoxTemplates, clone_vm_id: str
) -> Service | bool:

    try:
        proxmox: ProxmoxAPI = get_proxmox_client()

        # Clone the VM
        proxmox_node = template.proxmox_node
        proxmox_vm_id = template.proxmox_vm_id
        storage_name = "local-lvm"

        print(
            f"Cloning VM Template with ID {proxmox_vm_id} to {vmObject.hostname} with ID {clone_vm_id}"
        )
        clone_task = (
            proxmox.nodes(proxmox_node)
            .qemu(proxmox_vm_id)
            .clone.create(
                newid=clone_vm_id,
                full=1,
                name=vmObject.hostname,
                node=proxmox_node,
                storage=storage_name,
            )
        )

        vmObject.proxmox_vm_id = clone_vm_id
        vmObject.proxmox_node = proxmox_node
        vmObject.hostname = vmObject.hostname
        vmObject.status = "cloning"
        vmObject.updated_at = datetime.now()

        Tasks.blocking_status(proxmox, clone_task)
    except Exception as e:
        print(f"Failed to clone VM: {e}")
        try:
            proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()
        except Exception as delete_error:
            print(f"Failed to delete VM {clone_vm_id}: {delete_error}")
        return False

    return vmObject


@activity.defn
async def configure_vm(
    vmObject: Service,
    encoded_ssh_key: str,
) -> Service | bool:

    try:
        proxmox: ProxmoxAPI = get_proxmox_client()
        proxmox_node = vmObject.proxmox_node
        dbClient: Client = get_supabase_client()
        clone_vm_id = vmObject.proxmox_vm_id
        extracted = tldextract.extract(vmObject.hostname)
        if extracted.registered_domain == "":
            domain = "example.com"
        else:
            domain = extracted.registered_domain

        rawSku = dbClient.table("Sku").select("*").eq("id", vmObject.sku_id).execute()

        if not rawSku.data or len(rawSku.data) == 0:
            print(f"Sku {vmObject.sku_id} not found in the database")
            if os.environ.get("DEBUG") == "true":
                proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()
            return False

        sku = Sku(**rawSku.data[0])

        core_count = sku.attributes.cpu_cores

        memory_size = sku.attributes.memory * 1024

        # Configure the VM

        print(f"Configuring VM {vmObject.hostname} with ID {clone_vm_id}")
        # Set the userdata as desired BEFORE starting the machine:
        proxmox.nodes(proxmox_node).qemu(clone_vm_id).config.set(
            cores=str(core_count),
            memory=str(memory_size),
            ciuser=vmObject.username,
            sshkeys=encoded_ssh_key,
            ciupgrade=1,
            ipconfig0="ip=dhcp,ip6=auto",
            nameserver="1.1.1.1",
            searchdomain=domain,
        )
    except Exception as e:
        print(f"Failed to configure VM: {e}")
        if os.environ.get("DEBUG") == "true":
            proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()
        return False

    return vmObject


# @activity.defn
# async def resize_vm(
#     template: ProxmoxTemplates,
#     vmObject: Service,
# ) -> Service | bool:
#     proxmox: ProxmoxAPI = get_proxmox_client()
#     proxmox_node = vmObject.proxmox_node
#     clone_vm_id = vmObject.proxmox_vm_id


#     # Resize the VM
#     print(f"Resizing VM {vmObject.hostname} with ID {clone_vm_id}")
#     try:
#         proxmox.nodes(proxmox_node).qemu(clone_vm_id).resize.create(
#             cores=template.cores,
#             memory=template.memory,
#         )


@activity.defn
async def start_vm(
    vmObject: Service,
) -> Service | bool:

    proxmox: ProxmoxAPI = get_proxmox_client()
    proxmox_node = vmObject.proxmox_node
    clone_vm_id = vmObject.proxmox_vm_id

    # Start the VM
    print(f"Starting VM {vmObject.hostname} with ID {clone_vm_id}")
    try:
        proxmox.nodes(proxmox_node).qemu(clone_vm_id).status.start.create()

    except Exception as e:
        proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()
        print(f"Failed to start VM: {e}")
        return False

    return vmObject


@activity.defn
async def update_service_in_database(vmObject: Service) -> bool:
    proxmox: ProxmoxAPI = get_proxmox_client()
    dbClient: Client = get_supabase_client()
    service_id = vmObject.id
    proxmox_node = vmObject.proxmox_node
    clone_vm_id = vmObject.proxmox_vm_id

    try:
        # Update the service status in the database
        vmObject.status = "provisioned"
        vmObject.proxmox_vm_id = str(clone_vm_id)
        vmObject.proxmox_node = proxmox_node
        vmObject.updated_at = datetime.now()
        dbClient.table("Services").update(json.loads(vmObject.model_dump_json())).eq(
            "id", service_id
        ).execute()
        print(f"Updated service {service_id} in the database")
    except Exception as e:
        print(f"Failed to update service in database: {e}")
        if os.environ.get("DEBUG") == "true":
            stopvm = proxmox.nodes(proxmox_node).qemu(clone_vm_id).status.stop.create()
            Tasks.blocking_status(proxmox, stopvm)
            proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()
        return False

    if os.environ.get("DEBUG") == "true":
        print(f"VM {vmObject.hostname} with ID {clone_vm_id} created successfully")
        stopvm = proxmox.nodes(proxmox_node).qemu(clone_vm_id).status.stop.create()
        Tasks.blocking_status(proxmox, stopvm)
        proxmox.nodes(proxmox_node).qemu(clone_vm_id).delete()

    return True
