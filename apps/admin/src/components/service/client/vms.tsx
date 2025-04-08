"use client";
import type { Sku } from "database"
import { useState } from "react";

type attributes = {
    cpu_cores: number;
    memory: number;
    storage_size: number;
}

type specs = {
    vm_list: Sku[];
}

export function VM_Specs({ vm_list }: specs) {
    const [selectedVm, setSelectedVm] = useState<string | null>(null);
    let vm = vm_list.find((vm) => vm.id === selectedVm);
    let attributes = vm?.attributes as attributes;

    const handleVmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        vm = vm_list.find((vm) => vm.id === selectedVm);
        attributes = vm?.attributes as attributes;
        setSelectedVm(event.target.value);
    };

    return (
        <div>
            <label htmlFor="size" className="fieldset-label">Size</label>
            <select id="size" required name="size" onChange={handleVmChange} defaultValue="" className="select select-bordered validator w-full">
                <option disabled value="">Select a VM</option>
                {vm_list.map((vm) => (
                    <option key={vm.id} value={vm.id}>{vm.sku}</option>
                ))}
            </select>
            <p className="validator-hint">Required</p>
            {(selectedVm !== null) && (
                <div>
                    <div className="flex pt-2 text-center justify-center w-full">
                        <div className="stats stats-vertical lg:stats-horizontal  shadow">
                            <div className="stat">
                                <div className="stat-title">Price</div>
                                <div className="stat-value">${vm?.price} / mo</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">CPU Cores</div>
                                <div className="stat-value">{attributes.cpu_cores}</div>
                            </div>

                            <div className="stat">
                                <div className="stat-title">Memory</div>
                                <div className="stat-value">{attributes.memory}</div>
                            </div>

                            <div className="stat">
                                <div className="stat-title">Storage</div>
                                <div className="stat-value">{attributes.storage_size}GB</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}