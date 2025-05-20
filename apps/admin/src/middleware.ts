import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // exclude _next/static
    "/((?!_next/static).*)",
    // exclude _next/image
    "/((?!_next/image).*)",
    // exclude favicon.ico
    "/((?!favicon\.ico).*)",
    // exclude /login
    "/((?!login).*)",
    // exclude /signup
    "/((?!signup).*)",
    // exclude common image extensions
    "/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // exclude _next/static
    "/dashboards/((?!_next/static).*)",
    // exclude _next/image
    "/dashboard/((?!_next/image).*)",
    // exclude favicon.ico
    "/dashboard/((?!favicon\.ico).*)",
    // exclude /login
    "/dashboard/((?!login).*)",
    // exclude /signup
    "/dashboard/((?!signup).*)",
    // exclude common image extensions
    "/dashboard/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
