"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push("/") // توجيه بعد تسجيل الدخول
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="mx-auto max-w-md space-y-4 rounded bg-white p-6 shadow"
    >
      <h2 className="text-center text-2xl font-bold">تسجيل الدخول</h2>

      {error && (
        <div className="rounded bg-red-100 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">البريد الإلكتروني</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border p-2 focus:ring focus:ring-blue-300"
          placeholder="example@domain.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">كلمة المرور</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border p-2 focus:ring focus:ring-blue-300"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
      </button>
    </form>
  )
}
