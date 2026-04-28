import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // تأكد من المسار الصحيح لملفك

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // إذا كان هناك كود في الرابط، نقوم بتبديله بجلسة (Session)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // بعد النجاح، وجه المستخدم لصفحة النظام الرئيسية
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // في حال وجود خطأ، وجهه لصفحة تسجيل الدخول مع رسالة خطأ
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
