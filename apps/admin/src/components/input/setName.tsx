
type NameProps = {
    first_name?: string
    last_name?: string
}


export default function SetName({ first_name, last_name }: NameProps) {
    return (
        <div>
            <label htmlFor="first_name" className="fieldset-label">First Name</label>
            <input
                required
                id="first_name"
                name="first_name"
                type="text"
                className="input w-full"
                defaultValue={first_name}
            />

            <label htmlFor="last_name" className="fieldset-label">Last Name</label>
            <input
                required
                id="last_name"
                name="last_name"
                type="text"
                className="input w-full"
                defaultValue={last_name}
            />
        </div>
    )
}