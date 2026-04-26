import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // إنشاء عميل Supabase للاستخدام في المتصفح فقط
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export const supabase = createClient()
