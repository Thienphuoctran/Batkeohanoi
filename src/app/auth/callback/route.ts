import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  // 1. Trường hợp PKCE Code Flow: Đổi code lấy session trên Server
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const cookieStore = await cookies();
      cookieStore.set("bk7_access_token", data.session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      cookieStore.set("bk7_user_id", data.session.user.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 2. Trường hợp Implicit Grant Flow: Trả về trang HTML Client siêu tốc
  // Trình duyệt giữ nguyên hash #access_token=... để JS client đọc được,
  // gọi API /api/auth/sync-cookie lưu session rồi chuyển về trang chủ!
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Đang hoàn tất đăng nhập — BắtKèo7</title>
  <style>
    body {
      background-color: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: linear-gradient(180deg, rgba(22, 29, 45, 0.95) 0%, rgba(15, 20, 32, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 36px 28px;
      text-align: center;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 16px 48px -8px rgba(0,0,0,0.6);
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin: 0 0 10px; font-size: 19px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Đang Hoàn Tất Đăng Nhập Google</h2>
    <p id="status-text">Đang đồng bộ phiên tài khoản vào hệ thống...</p>
  </div>
  <script>
    (async function() {
      const statusText = document.getElementById('status-text');
      try {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          if (accessToken) {
            let userId = '';
            try {
              const payload = JSON.parse(atob(accessToken.split('.')[1]));
              userId = payload.sub || payload.id || '';
            } catch(e) {}

            await fetch('/api/auth/sync-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken, userId })
            });

            statusText.innerText = "Xác thực thành công! Đang vào sân...";
            window.location.replace('/');
            return;
          }
        }
      } catch (err) {
        console.error("Auth sync error", err);
      }
      setTimeout(() => {
        window.location.replace('/');
      }, 1200);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
