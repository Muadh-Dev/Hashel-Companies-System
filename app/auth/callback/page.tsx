"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // الاستماع لأي تغير في حالة المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // تم تسجيل الدخول بنجاح – انتقال إلى الصفحة المحمية
        router.replace("/")
      } else if (event === "SIGNED_OUT") {
        // خروج غير متوقع
        router.replace("/login")
      }
    })

    // في حالة كانت الجلسة موجودة مسبقًا (مثلاً إعادة تحميل الصفحة بعد الكول باك)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center text-gray-600">
      إتمام تسجيل الدخول...
    </div>
  )
}
