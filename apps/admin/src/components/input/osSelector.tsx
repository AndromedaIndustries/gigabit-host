import { prisma } from "database"

export default async function OsSelector() {

    const templates = await prisma.proxmoxTemplates.findMany({})

    if (!templates) {
        throw new Error("No templates found")
    }

    return (
        <div>
            <label htmlFor="os" className="fieldset-label">OS</label>
            <select id="os" name="os" className="select select-bordered w-full">
                <option disabled>Select an OS</option>
                {templates.map((template) => {
                    return <option key={template.name} value={template.name}>{template.name} - {template.version}</option>
                })}
            </select>
        </div>
    )
}