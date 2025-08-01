"use client"
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import { useState } from 'react'


export default function Page() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            redirect("/dashboard")

        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-row pt-20 px-10 pb-24">
            <div className="w-120 bg-base-200 border-base-300 rounded-box">
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
        </div>
    )

}