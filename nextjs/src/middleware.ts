import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/session";

const isDev = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return !url || url.includes("placeholder");
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  if (isDev()) return response;

  const { pathname } = request.nextUrl;
  const { user, response: mutated } = await updateSession(request, response);

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !user
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return mutated;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|fonts|uploads).*)"],
};
