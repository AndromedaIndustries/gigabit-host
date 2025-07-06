import { UpdatePasswordForm } from '@/components/auth/resetPassword';


export default async function Page() {
    return (
        <div className="flex items-center justify-center h-screen bg-base-100">
            <UpdatePasswordForm />
        </div>
    )
}