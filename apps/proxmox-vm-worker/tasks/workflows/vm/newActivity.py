from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy


# Import activity, passing it through the sandbox without reloading the module
with workflow.unsafe.imports_passed_through():
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


@workflow.defn
class NewProxmoxVM:
    @workflow.run
    async def run(self, payload: dict) -> bool:
        # Extract the first item from the payloads list
        user_id = payload["user_id"]
        service_id = payload["service_id"]

        workflow.logger.info(
            f"Creating new VM for user {user_id} with service ID {service_id}"
        )

        # Get the service from the database
        vmObject = await workflow.execute_activity(
            get_service_from_database,
            args=[user_id, service_id, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not vmObject:
            workflow.logger.info(
                f"Failed to get service {service_id} from the database"
            )
            return False

        # Get the template from the database
        template = await workflow.execute_activity(
            get_template,
            args=[vmObject, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not template:
            workflow.logger.info(
                f"Failed to get template {vmObject.template_id} from the database"
            )
            return False

        # Get the public key from the database
        public_key = await workflow.execute_activity(
            get_public_key,
            args=[user_id, vmObject, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not public_key:
            workflow.logger.info(
                f"Failed to get public key {vmObject.public_key_id} from the database"
            )
            return False

        # Get the next VM ID from Proxmox
        clone_vm_id = await workflow.execute_activity(
            get_next_vm_id,
            args=[workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )
        if not clone_vm_id:
            workflow.logger.info(f"Failed to get next VM ID from Proxmox")
            return False

        # Clone the VM
        newVmObject = await workflow.execute_activity(
            clone_vm,
            args=[vmObject, template, str(clone_vm_id), workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )
        if not newVmObject:
            workflow.logger.info(
                f"Failed to clone VM {vmObject.name} from template {template}"
            )
            return False

        # Configure the VM
        configure_vm_result = await workflow.execute_activity(
            configure_vm,
            args=[newVmObject, public_key, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not configure_vm_result:
            workflow.logger.info(
                f"Failed to configure VM {newVmObject.name} from template {template}"
            )
            return False

        # Start the VM
        start_vm_result = await workflow.execute_activity(
            start_vm,
            args=[newVmObject, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not start_vm_result:
            workflow.logger.info(
                f"Failed to start VM {newVmObject.name} from template {template}"
            )
            return False

        # Update the object in the database
        update_database = await workflow.execute_activity(
            update_service_in_database,
            args=[newVmObject, workflow.logger],
            schedule_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(
                maximum_attempts=1,
            ),
        )

        if not update_database:
            workflow.logger.info(
                f"Failed to update VM {newVmObject.name} in the database"
            )
            return False

        # return the result
        return True
