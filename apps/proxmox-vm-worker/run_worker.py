import asyncio

from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.client import Client
from temporalio.worker import Worker

from tasks.workflows.vm.templateWorkflow import UpdateProxmoxTemplates
from tasks.activities.vm.templateActivity import update_proxmox_templates

from tasks.workflows.vm.newActivity import NewProxmoxVM
from tasks.activities.vm.newActivity import (
    get_service_from_database,
    get_template,
    get_public_key,
    get_next_vm_id,
    configure_vm,
    clone_vm,
    start_vm,
    update_service_in_database,
)

import os
from dotenv import load_dotenv


async def main():

    # Load environment variables from .env file
    load_dotenv()

    # Get the debug flag from environment variables
    debug = os.environ.get("DEBUG", False) == "true"
    if debug:
        print("Debug mode is enabled")

    # Get the temporal server address from environment variables
    temporal_server = os.environ.get("TEMPORAL_SERVER", "localhost:7233")
    if debug:
        print(f"Temporal Server: {temporal_server}")

    # Get the task queue from environment variables
    task_queue = os.environ["PROXMOX_TASK_QUEUE"]
    if debug:
        print(f"Task Queue: {task_queue}")

    # Get the namespace from environment variables
    namespace = os.environ.get("NAMESPACE", "default")
    if debug:
        print(f"Namespace: {namespace}")

    client = await Client.connect(
        temporal_server,
        namespace=namespace,
        data_converter=pydantic_data_converter,
    )
    # Run the worker
    worker = Worker(
        client,
        task_queue=task_queue,
        workflows=[UpdateProxmoxTemplates, NewProxmoxVM],
        activities=[
            update_proxmox_templates,
            get_service_from_database,
            get_template,
            get_public_key,
            get_next_vm_id,
            configure_vm,
            clone_vm,
            start_vm,
            update_service_in_database,
        ],
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
