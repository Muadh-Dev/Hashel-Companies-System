"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading, error, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session && !error) {
      router.replace("/login")
    }
  }, [loading, session, error, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-500">حدث خطأ: {error}</p>
        <button
          onClick={() => location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          إعادة المحاولة
        </button>
        <button
          onClick={signOut}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          تسجيل الخروج
        </button>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
