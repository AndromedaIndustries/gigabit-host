"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        console.log('hello')

        try {
            const { error } = await supabase.auth.updateUser({ password });
            console.log(error)
            if (error) throw error;
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/dashboard");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    //onChange={(e) => setPassword(e.target.value)}

    return (
        <form className="flex flex-col gap-4 p-6 bg-base-200 rounded-lg shadow-md w-full max-w-sm mx-auto justify-center" onSubmit={handleForgotPassword}>
            <fieldset>
                <h1 className="text-2xl font-bold text-center">Update your password</h1>

                <label htmlFor="password" className="fieldset-label">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="input w-full"
                    required
                    placeholder="Password"
                    minLength={8}
                    pattern=".{12,}"
                    title="Must be more than 12 characters"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <p className="validator-hint hidden">Must be more than 12 characters</p>
                <div className='align-middle flex flex-col justify-between pt-6'>
                    <button type="submit" className="btn btn-outline btn-primary">Update Password</button>
                </div>
            </fieldset>
        </form>
    );
}