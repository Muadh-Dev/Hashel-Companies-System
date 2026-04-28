"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import type { Session, AuthChangeEvent } from "@supabase/supabase-js"

interface AuthContextType {
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => void
  retry: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // دالة إعادة المحاولة (في حالة فشل مؤقت)
  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    // مجرد إعادة فحص الجلسة
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // التهيئة الأولى
  useEffect(() => {
    let mounted = true
    setLoading(true)

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data.session)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    // الاستماع لتغيرات المصادقة
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (mounted) {
          setSession(newSession)
          setError(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(() => {
    supabase.auth.signOut().catch(console.error)
    setSession(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, error, signOut, retry }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
