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

import logging
import os
from dotenv import load_dotenv


async def main():

    # Set up logging
    logging.basicConfig(level=logging.INFO)

    # Load environment variables from .env file
    load_dotenv()

    # Get the debug flag from environment variables
    debug = os.environ.get("DEBUG", False) == "true"
    if debug:
        logging.info("Debug mode is enabled")

    # Get the temporal server address from environment variables
    temporal_server = os.environ.get("NEXT_PUBLIC_TEMPORAL_SERVER", "localhost:7233")
    if debug:
        logging.info(f"Temporal Server: {temporal_server}")

    # Get the task queue from environment variables
    task_queue = os.environ["NEXT_PUBLIC_PROXMOX_TASK_QUEUE"]
    if debug:
        logging.info(f"Task Queue: {task_queue}")

    # Get the namespace from environment variables
    namespace = os.environ.get("NEXT_PUBLIC_PROXMOX_NAMESPACE", "default")
    if debug:
        logging.info(f"Namespace: {namespace}")

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
