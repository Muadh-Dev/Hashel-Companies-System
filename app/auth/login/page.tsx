"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation" // ✅ التصحيح
import { createClient } from "@/lib/supabase/supabaseSsrClient" // مسارك الصحيح
import { login } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          جاري الدخول...
        </span>
      ) : (
        "تسجيل الدخول"
      )}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { error: "" })
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        console.log(
          "👤 [LoginPage] User already logged in, redirecting from client"
        )
        router.replace("/")
      } else {
        setCheckingSession(false)
      }
    }
    checkUser()
  }, [router])

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        <div className="animate-pulse text-slate-400">التحقق من الجلسة...</div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white">
            هـ
          </div>
          <h1 className="text-2xl font-bold text-slate-900">هاشل اليامي</h1>
          <p className="mt-2 text-slate-500">
            سجّل دخولك للوصول إلى لوحة التحكم
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="example@domain.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-right text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-right text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
            />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {state.error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
