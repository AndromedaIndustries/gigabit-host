import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { userMetadata } from '@/types/userMetadata'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const adminURL = "https://portal.gigabit.host"


    if (token_hash && type) {
        const supabase = await createClient()

        const userResponse = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (userResponse.error) {
            return NextResponse.redirect(adminURL + "/dashboard/login")
        }

        const user = userResponse.data.user

        if (!user) {
            return NextResponse.redirect(adminURL + "/dashboard/login")
        }

        await supabase.auth.updateUser({
            data: {
                "email_verified": true
            }
        })

        if (user.user_metadata) {
            const metadata = user.user_metadata as userMetadata

            if (metadata.first_name == "" || metadata.last_name == "" || metadata.account_type == "") {
                // if any of the above is blank, redirect the user to update their information
                return NextResponse.redirect(adminURL + "/dashboard/update")
            }
        }
    }
    return NextResponse.redirect(adminURL + "/dashboard")
}