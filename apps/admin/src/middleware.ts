import { NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

// A helper to get a best-effort client IP on Edge
function getClientIp(req: NextRequest): string | null {
  // Prefer x-forwarded-for (standard behind proxies)
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;

  // Some providers set these
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    null
  );
}

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Let your existing auth/session logic run
  const response = await updateSession(request);

  // Propagate request-id so Node routes can include it in logs too
  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: [
    // exclude _next/static
    "/dashboards/((?!_next/static).*)",
    // exclude _next/image
    "/dashboard/((?!_next/image).*)",
    // exclude favicon.ico
    "/dashboard/((?!favicon\.ico).*)",    // exclude common image extensions
    "/dashboard/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
