"use client";
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export function OpenPasswordModal() {
    function openModal() {
        const modal = document.getElementById("password_modal") as HTMLDialogElement | null;

        if (!modal) {
            return;
        }

        if (modal as HTMLDialogElement) {
            modal.showModal();
        }
    }

    return (
        <button type="button" onClick={openModal} className="btn btn-accent">Update Password</button>
    )
}


export function UpdatePasswordModal() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleForgotPassword = async (e: React.FormEvent) => {
        const modal = document.getElementById("password_modal") as HTMLDialogElement | null;
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) setError(error instanceof Error ? error.message : 'An error occurred')
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <dialog id="password_modal" className="modal">
            <div className="modal-box">

                <form onSubmit={handleForgotPassword}>
                    <fieldset className="fieldset  bg-base-200 p-4 rounded-box">
                        <legend className="fieldset-legend">Update Password</legend>
                        <label htmlFor="password" className="fieldset-label">New Password</label>
                        <input
                            required
                            id="password"
                            name="new_password"
                            type="password"
                            className="input w-full"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className='flex flex-row place-content-end pt-6 w-full'>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button type="submit" className="btn btn-warning" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save new password'}
                            </button>
                        </div>

                    </fieldset>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}