"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      router.replace("/login?error=no_code")
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }: any) => {
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`)
        } else {
          router.replace("/dashboard")
        }
      })
      .catch(() => router.replace("/login?error=unknown"))
  }, [router, searchParams])

  return (
    <div className="flex h-screen items-center justify-center text-gray-600">
      جارٍ تسجيل الدخول...
    </div>
  )
}
