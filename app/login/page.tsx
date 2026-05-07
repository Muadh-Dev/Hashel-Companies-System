"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  // افترضنا أننا أضفنا signInWithPhone في ملف الـ Context
  const { signInWithPhone, loading } = useAuth()

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone || !password) {
      toast.error("يرجى إدخال رقم الجوال وكلمة المرور")
      return
    }

    try {
      await signInWithPhone(phone, password)
      toast.success("تم تسجيل الدخول بنجاح")
    } catch (err: any) {
      // الخطأ يتم معالجته غالباً داخل الـ Context أو هنا لإظهاره للمستخدم
      toast.error("خطأ في بيانات الدخول، يرجى التحقق من الرقم والسر")
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* أيقونة رمزية للنظام */}
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <img
            src="/HashelSMWaiteLogo.png"
            alt="logo"
            className="p-2.5 invert dark:invert-0"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            نظام هاشل للعمليات
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            منصة الإدارة المركزية والربط الذكي
          </p>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">
              بوابة الدخول الآمن
            </span>
          </div>
        </div>

        {/* نموذج تسجيل الدخول بالرقم والسر */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1 text-right">
            <label className="mr-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              رقم الجوال
            </label>
            <input
              type="text"
              placeholder="05xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right transition-all outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1 text-right">
            <label className="mr-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right transition-all outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        {/* GOOGLE SIGN-IN OPTION (DISABLED PER CLIENT REQUEST)
          To re-enable, uncomment the code below and ensure signInWithGoogle is imported from useAuth.
          
          <div className="mt-6">
            <button
              onClick={signInWithGoogle}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-700 shadow-sm transition-all hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              الدخول عبر حساب جوجل
            </button>
          </div>
        */}

        <p className="pt-4 text-[10px] text-slate-400 dark:text-slate-500">
          وصول المصرح لهم فقط
        </p>
      </div>
    </div>
  )
}
