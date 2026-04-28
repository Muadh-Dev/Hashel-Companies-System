"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }: any) => {
        if (!error) {
          router.replace("/") // أو أي مسار محمي
        } else {
          router.replace("/login?error=exchange_failed")
        }
      })
    } else {
      router.replace("/login?error=no_code")
    }
  }, [router, searchParams])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>إتمام تسجيل الدخول...</p>
    </div>
  )
}
