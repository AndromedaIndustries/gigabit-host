import { signIn } from "@repo/auth";

export function SignIn() {
    return (
        <form
            action={async (formData) => {
                "use server"
                await signIn("credentials", formData)
            }}
        >
            <label>
                Email
                <input name="email" type="email" />
            </label>
            <label>
                Password
                <input name="password" type="password" />
            </label>
            <button type="button">Sign In</button>
        </form>
    )
}