import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // PKCE code chỉ dùng được 1 lần — auto-detect mặc định của SDK sẽ tự exchange code trên URL
      // ngay khi client khởi tạo, đụng (và thắng) lệnh exchangeCodeForSession thủ công trong
      // app/auth/callback/page.tsx. Tắt auto-detect để chỉ /auth/callback là nơi duy nhất xử lý code.
      auth: { detectSessionInUrl: false },
    }
  )
}

export const supabase = createClient()
