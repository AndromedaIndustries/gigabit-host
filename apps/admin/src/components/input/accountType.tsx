
type AccountTypeProps = {
    accountType?: string
}

export default function AccountType({ accountType }: AccountTypeProps) {

    if (!accountType) {
        accountType = "Set Account Type";
    }

    return (
        <div>
            <label htmlFor="account_type" className="fieldset-label">Account Type</label>
            <select
                required
                id="account_type"
                name="account_type"
                defaultValue={accountType}
                className="select w-full"
            >
                <option disabled>Set Account Type</option>
                <option>Personal</option>
                <option>Business</option>
            </select>
        </div>
    )
}