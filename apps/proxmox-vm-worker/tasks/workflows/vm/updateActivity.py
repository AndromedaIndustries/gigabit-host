from datetime import timedelta
from temporalio import workflow

# Import activity, passing it through the sandbox without reloading the module
with workflow.unsafe.imports_passed_through():
    from tasks.activities.vm.updateActivity import update_proxmox_vm


@workflow.defn
class UpdateProxmoxVM:
    @workflow.run
    async def run(self) -> bool:
        return await workflow.execute_activity(
            update_proxmox_vm, start_to_close_timeout=timedelta(seconds=5)
        )
