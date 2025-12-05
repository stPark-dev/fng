import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 리프레시 토큰을 통해 세션을 업데이트합니다.
  // getUser()를 호출하면 세션이 유효한지 확인하고 필요시 갱신합니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 경로 정의
  // 로그인이 필요한 경로들: /dashboard, /board, /game 등
  // 공개 경로: /, /login, /signup, /auth/* (인증 콜백 등)
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  // 로그인이 안 되어 있는데 보호된 경로에 접근하려는 경우
  if (!user && !isPublicPath) {
    // 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인이 되어 있는데 로그인/회원가입 페이지에 접근하려는 경우 (선택 사항)
  // if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/dashboard';
  //   return NextResponse.redirect(url);
  // }

  return response;
}
