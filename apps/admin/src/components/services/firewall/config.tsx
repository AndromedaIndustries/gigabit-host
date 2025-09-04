import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown,
    faXmark,
    faPen,
    faCheckSquare,
    faXmarkSquare
} from "@fortawesome/free-solid-svg-icons"
import { Proxmox } from "proxmox-api";
import ToggleRule from "./actions/toggleRule";
import { type CommonFirewallParameters } from "./actions/common";
import DeleteRule from "./actions/deleteRule";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { MoveRule } from "./actions/moveRule";

type FirewallConfigTable = {
    firewallRules: Proxmox.nodesQemuFirewallRulesGetRule[],
    proxmox_node: string
    proxmox_vm_id: number
}



export async function FirewallConfig(
    { vm_id, firewallRules, proxmox_node, proxmox_vm_id }: {
        vm_id: string,
        firewallRules: Proxmox.nodesQemuFirewallRulesGetRule[], proxmox_node: string,
        proxmox_vm_id: number
    }) {

    return (
        <div>
            <table className="table table-xs table-pin-rows table-zebra">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Enabled</th>
                        <th>Type</th>
                        <th >IP<br />Version</th>
                        <th>Action</th>
                        <th>Proto</th>
                        <th className="w-32">Source IP</th>
                        <th>Source<br /> Port</th>
                        <th className="w-32">Destination IP</th>
                        <th>Destination Port/<br /> ICMP Type</th>
                        <th className="w-32">Comment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {firewallRules.map((rule) => (
                        <FirewallRuleRow vm_id={vm_id} firewallRule={rule} proxmox_node={proxmox_node} proxmox_vm_id={proxmox_vm_id} key={rule.pos} />
                    ))}
                </tbody>

            </table>
        </div>
    )

}

enum ipVersionEnum {
    "IPv4" = 4,
    "IPv6" = 6
}

async function FirewallRuleRow(
    { vm_id, firewallRule, proxmox_node, proxmox_vm_id }: {
        vm_id: string,
        firewallRule: Proxmox.nodesQemuFirewallRulesGetRule, proxmox_node: string,
        proxmox_vm_id: number
    }) {

    let ipVersionText = "ALL"
    const ipVersion = firewallRule.ipversion
    const protocol = firewallRule.proto || "ALL"
    const sourceIp = firewallRule.source || "ALL"
    const sourcePort = firewallRule.sport || "ALL"
    const destinationIp = firewallRule.dest || "ALL"
    const destPort = firewallRule.dport || firewallRule["icmp-type"] || "ALL"

    if (typeof ipVersion == typeof Number) {
        if (ipVersion == ipVersionEnum.IPv4) {
            ipVersionText = ipVersionEnum[4]
        }
        if (ipVersion == ipVersionEnum.IPv6) {
            ipVersionText = ipVersionEnum[6]
        }
    }


    return (
        <tr id={firewallRule.pos.toString()}>
            <td>{firewallRule.pos}</td>
            <td><FirewallEnableToggle
                vm_id={vm_id}
                rule_enabled={firewallRule.enable}
                rule_pos={firewallRule.pos}
                proxmox_node={proxmox_node}
                proxmox_vm_id={proxmox_vm_id}
            /> </td>
            <td>{firewallRule.type.toUpperCase()}</td>
            <td>{ipVersionText.toUpperCase()}</td>
            <td>{firewallRule.action.toUpperCase()}</td>
            <td>{protocol?.toUpperCase()}</td>
            <td>{sourceIp.toUpperCase()}</td>
            <td>{sourcePort.toUpperCase()}</td>
            <td>{destinationIp.toUpperCase()}</td>
            <td>{destPort.toUpperCase()}</td>
            <td>{firewallRule.comment}</td>
            <td className="grid grid-cols-5">
                {(firewallRule.pos != 0) ? (
                    <div className="tooltip" data-tip="Move Rule Up">
                        <MoveRuleButton
                            vm_id={vm_id}
                            rule_pos={firewallRule.pos}
                            proxmox_node={proxmox_node}
                            proxmox_vm_id={proxmox_vm_id}
                            direction="up"
                        />
                    </div>) : ""}
                <div className="tooltip" data-tip="Move Rule Down">
                    <MoveRuleButton
                        vm_id={vm_id}
                        rule_pos={firewallRule.pos}
                        proxmox_node={proxmox_node}
                        proxmox_vm_id={proxmox_vm_id}
                        direction="down"
                    />
                </div>
                {/* <div className="tooltip" data-tip="Edit Rule">
                    <button>
                        <FontAwesomeIcon icon={faPen} className="text-accent" />
                    </button>
                </div> */}
                <div className="tooltip" data-tip="Delete Rule">
                    <FirewallDeleteButton
                        vm_id={vm_id}
                        rule_pos={firewallRule.pos}
                        proxmox_node={proxmox_node}
                        proxmox_vm_id={proxmox_vm_id}
                    />
                </div>
            </td>
        </tr>
    )
}

async function MoveRuleButton({ vm_id, rule_pos, proxmox_node, proxmox_vm_id, direction }: {
    vm_id: string, rule_pos: number, proxmox_node: string, proxmox_vm_id: number, direction: string
}) {
    var icon: IconProp
    var new_pos: number

    if (direction == "up") {
        icon = faArrowUp
        new_pos = rule_pos - 1
    } else {
        icon = faArrowDown
        new_pos = rule_pos++
    }

    async function moveRule() {
        // Server Function
        'use server';

        await MoveRule({
            vm_id: vm_id,
            proxmox_vm_id: proxmox_vm_id,
            proxmox_node: proxmox_node,
            rule_pos: rule_pos.toString()
        }, new_pos)
    }

    return (
        <button onClick={moveRule}>
            <FontAwesomeIcon icon={icon} className="text-secondary" />
        </button>
    )

}

async function FirewallDeleteButton({ vm_id, rule_pos, proxmox_node, proxmox_vm_id }: {
    vm_id: string, rule_pos: number, proxmox_node: string, proxmox_vm_id: number
}) {

    async function deleteRule() {
        // Server Function
        'use server';

        await DeleteRule({
            vm_id: vm_id,
            proxmox_vm_id: proxmox_vm_id,
            proxmox_node: proxmox_node,
            rule_pos: rule_pos.toString()
        })
    }

    return (
        <button onClick={deleteRule}>
            <FontAwesomeIcon icon={faXmark} className="text-error" />
        </button>
    )

}

async function FirewallEnableToggle({ vm_id, rule_enabled, rule_pos, proxmox_node, proxmox_vm_id }: {
    vm_id: string,
    rule_enabled: number | undefined, rule_pos: number, proxmox_node: string, proxmox_vm_id: number
}) {

    async function toggleRuleAction() {
        // Server Function
        'use server';

        var value

        (!rule_enabled) ? value = 1 : value = 0;

        await ToggleRule({
            vm_id: vm_id,
            proxmox_vm_id: proxmox_vm_id,
            proxmox_node: proxmox_node,
            rule_pos: rule_pos.toString()
        }, value)
    }


    return (
        <button onClick={toggleRuleAction}>
            {(rule_enabled) ?
                <FontAwesomeIcon icon={faCheckSquare} className="text-success" />
                :
                <FontAwesomeIcon icon={faXmarkSquare} className="text-error" />
            }
        </button>
    )

}