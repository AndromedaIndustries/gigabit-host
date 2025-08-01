import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        revalidatePath("/dashboard")

        if (!error) {
            return NextResponse.redirect(new URL(redirectTo, request.url))
        }
    }

    return NextResponse.redirect(new URL("/dashboard/login", request.url))
}