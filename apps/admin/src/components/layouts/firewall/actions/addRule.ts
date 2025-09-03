"use server";
import { proxmoxClient } from "@/utils/proxmox/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "database";
import { redirect, RedirectType } from 'next/navigation'
import { Proxmox } from "proxmox-api";


function checkUndefined(value: FormDataEntryValue | null, other?: string) {
    if (value == undefined) {
        if (other != undefined) {
            return other
        }
        return ""
    }
    return value.toString()
}

type ConvertOptions = {
    option1?: [string, any];
    option2?: [string, any];
    option3?: [string, any];
    option4?: [string, any];
    option5?: [string, any];
};

function convertProxmoxType<T>(value: string, options: ConvertOptions = {}): T {

    const {
        option1,
        option2,
        option3,
        option4,
        option5,
    } = options;



    if (option1 != undefined) {
        if (value == option1[0]) {
            return option1[1] as T
        }
    }

    if (option2 != undefined) {
        if (value == option2[0]) {
            return option2[1] as T
        }
    }

    if (option3 != undefined) {
        if (value == option3[0]) {
            return option3[1] as T
        }
    }

    if (option4 != undefined) {
        if (value == option4[0]) {
            return option4[1] as T
        }
    }

    if (option5 != undefined) {
        if (value == option5[0]) {
            return option5[1] as T
        }
    }


    return value as T
}


export default async function NewRuleSubmit(formData: FormData) {
    const formVmId = checkUndefined(formData.get("vmId"))
    const formPosition = checkUndefined(formData.get("position"))
    const formType = checkUndefined(formData.get("type"))
    const formAction = checkUndefined(formData.get("action"))
    const formProtocol = checkUndefined(formData.get("protocol"))
    const formSource = checkUndefined(formData.get("source"))
    const formSourcePort = checkUndefined(formData.get("sport"))
    const formDestination = checkUndefined(formData.get("desination"))
    const formDestinationPort = checkUndefined(formData.get("dport"))
    const formEnable = checkUndefined(formData.get("enable"))
    const formComment = checkUndefined(formData.get("comment"))


    const supabase = await createClient();
    const userObject = await supabase.auth.getUser();
    const user_id = userObject.data.user?.id;

    const vm = await prisma.services.findFirst({
        where: {
            user_id: user_id,
            id: formVmId,
        },
    });

    if (!vm) {
        throw new Error("VM not found");
    }

    if (!vm.proxmox_node) {
        throw new Error("Proxmox node Not Defined")
    }

    if (!vm.proxmox_vm_id) {
        throw new Error("Proxmox vm id Not Defined")
    }

    const vm_proxmox_node = vm.proxmox_node
    const vm_proxmox_id = parseInt(vm.proxmox_vm_id, 10)
    const proxmoxApi = await proxmoxClient();

    const currentFirewallList = await proxmoxApi.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$get()

    const numberOfRules = currentFirewallList.length
    let positionInt: number

    if (formPosition == undefined) {
        positionInt = numberOfRules + 1
    } else {
        positionInt = Number.parseInt(formPosition.toString(), 10)
    }

    const enabledValue = (formEnable == "") ? 0 : 1;

    await proxmoxApi.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$post({
        type: formType.toLowerCase() as Proxmox.Ttype_1,
        action: formAction,
        proto: formProtocol.toLowerCase(),
        source: formSource,
        sport: formSourcePort,
        dest: formDestination,
        dport: formDestinationPort,
        enable: enabledValue,
        comment: formComment,
    })

    if (Number.parseInt(formPosition) != 0) {
        await proxmoxApi.nodes.$(vm_proxmox_node).qemu.$(vm_proxmox_id).firewall.rules.$("0").$put({
            moveto: Number.parseInt(formPosition)
        })
    }

    redirect(`/dashboard/vm/${vm.id}/firewall`, RedirectType.push)
}
