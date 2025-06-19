import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ★★★ 変更点: /sign-in と /sign-up を公開ルートに追加 ★★★
const isPublicRoute = createRouteMatcher(["/", "/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, request) => {
  // もしアクセスされたページが公開ルートで「なければ」
  if (!isPublicRoute(request)) {
    const { userId } = await auth();

    // かつ、ログインもしていなければ
    if (!userId) {
      // サインインページにリダイレクトします。
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 公開ルート、またはログイン済みの場合は、そのままページ表示を許可します。
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
