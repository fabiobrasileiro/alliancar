import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        }
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // rotas públicas
  const publicRoutes = ["/login", "/signup", "/public", "/api", "/favicon.ico"];
  const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
};
