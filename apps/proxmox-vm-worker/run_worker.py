import asyncio

from temporalio.client import Client
from temporalio.worker import Worker

from tasks.workflows.vm.templateWorkflow import UpdateProxmoxTemplates
from tasks.activities.vm.templateActivity import update_proxmox_templates

from tasks.workflows.vm.newActivity import NewProxmoxVM
from tasks.activities.vm.newActivity import new_proxmox_vm

import os
from dotenv import load_dotenv


async def main():

    load_dotenv()

    task_queue = os.environ["PROXMOX_TASK_QUEUE"]
    if os.environ.get("DEBUG") == "true":
        print(f"Task Queue: {task_queue}")

    client = await Client.connect("localhost:7233", namespace="default")
    # Run the worker
    worker = Worker(
        client,
        task_queue=task_queue,
        workflows=[UpdateProxmoxTemplates, NewProxmoxVM],
        activities=[update_proxmox_templates, new_proxmox_vm],
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
