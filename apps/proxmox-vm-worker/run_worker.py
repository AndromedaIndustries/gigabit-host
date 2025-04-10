import asyncio

from temporalio.client import Client
from temporalio.worker import Worker

from tasks.workflows.templateWorkflow import UpdateProxmoxTemplates
from tasks.activities.templateActivity import update_proxmox_templates

from dotenv import load_dotenv


async def main():
    load_dotenv()

    client = await Client.connect("localhost:7233", namespace="default")
    # Run the worker
    worker = Worker(
        client,
        task_queue="proxmox-worker",
        workflows=[UpdateProxmoxTemplates],
        activities=[update_proxmox_templates],
    )
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
