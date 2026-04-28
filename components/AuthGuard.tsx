"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AlertCircle, LogOut, RefreshCw } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut, retryAuthorization } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // لا توجه إلى login إلا إذا لم تكن هناك جلسة ولا خطأ
    if (!loading && !user && !error) {
      router.replace("/login")
    }
  }, [loading, user, error, router])

  // حالة التحميل
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // خطأ في الصلاحية
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            لا توجد صلاحية
          </h2>
          <p className="mt-2 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white transition hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
            <button
              onClick={retryAuthorization}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-6 py-2.5 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
              المحاولة مرة أخرى
            </button>
          </div>
        </div>
      </div>
    )
  }

  // مستخدم مصرح
  if (user) {
    return <>{children}</>
  }

  // حالة احتياطية (يجب ألا تصل هنا في الوضع الطبيعي)
  return null
}
