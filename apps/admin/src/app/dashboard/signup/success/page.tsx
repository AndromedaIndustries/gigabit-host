

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const type = (await searchParams).type


    if (type == "otp") {
        return (
            <div className="flex items-center justify-center h-screen bg-base-100">
                <div className="bg-success text-success-content card">
                    <div className="card-body place-items-center">
                        <div>Successfully sent Magic Link</div>
                        <div>Check your email to complete Sign In</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <div className="bg-success text-success-content card">
                <div className="card-body place-items-center">
                    <div>Successfully created Account</div>
                    <div>Check your email to confirm your email address</div>
                </div>
            </div>
        </div>
    )

}