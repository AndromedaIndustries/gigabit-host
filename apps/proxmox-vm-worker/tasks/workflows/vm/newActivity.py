from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy


# Import activity, passing it through the sandbox without reloading the module
with workflow.unsafe.imports_passed_through():
    from tasks.activities.vm.newActivity import new_proxmox_vm


@workflow.defn
class NewProxmoxVM:
    @workflow.run
    async def run(self, payload: dict) -> bool:
        # Extract the first item from the payloads list
        user_id = payload["user_id"]
        service_id = payload["service_id"]

        return await workflow.execute_activity(
            new_proxmox_vm,
            args=(user_id, service_id),
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )
