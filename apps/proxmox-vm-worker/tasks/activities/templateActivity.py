import ulid
import os
from temporalio import activity
from proxmox.client import get_proxmox_client
from proxmoxer import *
from database.client import get_supabase_client
from supabase import Client
import datetime


@activity.defn
async def update_proxmox_templates() -> bool:

    proxmox: ProxmoxAPI = get_proxmox_client()
    dbClient: Client = get_supabase_client()

    for node in proxmox.nodes.get():
        for vm in proxmox.nodes(node["node"]).qemu.get():
            if vm["name"].startswith("template-"):

                # Split the name into parts
                # Format is template-<distro>-<version>
                split_name = vm["name"].split("-")

                distro = split_name[1]
                version = split_name[2]

                # check if the template is already in the database
                template = (
                    dbClient.table("ProxmoxTemplates")
                    .select("*")
                    .eq("proxmox_vm_id", vm["vmid"])
                    .eq("proxmox_node", node["node"])
                    .execute()
                )

                if os.environ.get("DEBUG") == "true":
                    print(template)

                if template.count is not None:
                    if os.environ.get("DEBUG") == "true":
                        print(f"Template {vm['name']} already in the database")
                    continue

                if os.environ.get("DEBUG") == "true":
                    print(f"Inserting template {vm['name']} into the database")

                if distro == "ubuntu":
                    distro = "ubuntu-server"
                    # split the version from 2404 to 24.04
                    version = version[:2] + "." + version[2:]

                # Insert the template into the database
                newTemplate = (
                    dbClient.table("ProxmoxTemplates")
                    .insert(
                        {
                            "id": ulid.new().str,
                            "name": distro,
                            "version": version,
                            "proxmox_vm_id": vm["vmid"],
                            "proxmox_node": node["node"],
                            "metadata": {
                                "distro": distro,
                                "version": version,
                                "proxmox": {
                                    "vmid": vm["vmid"],
                                    "node": node["node"],
                                    "name": vm["name"],
                                },
                            },
                            "updated_at": datetime.datetime.now(
                                tz=datetime.timezone.utc
                            ).isoformat(),
                        }
                    )
                    .execute()
                )

                if os.environ.get("DEBUG") == "true":
                    print(newTemplate)

    return True
