"use client";

import { HandleViewChange } from "./vmHelpers";

export function ViewSelector() {
    return (
        <select
            defaultValue="Pick a color"
            className="select"
            onChange={(e) => HandleViewChange(e.target.value as "card" | "table")}>
            <option value="table">Table View</option>
            <option value="card">Card View</option>
        </select>
    );
}