import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await (async () => {
    const res = await import("@/utils/supabase/middleware");
    const supabaseResponse = res.createClient(request);
    return supabaseResponse;
  })();

  const { pathname } = request.nextUrl;
  // Rotas públicas
  const publicPaths = [
    "/login",
    "/signup",
    "/favicon.ico",
    "/_next",
    "/api",
    "/public",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) return response;

  // Verifica sessão no cookie via Supabase SSR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  // Como criamos o cliente no util que já gerencia cookies, aqui apenas redirecionamos se não houver sessão.
  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (e) {
    // Fallback: se algo falhar, segue o request
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|signup|api|public).*)",
  ],
};
