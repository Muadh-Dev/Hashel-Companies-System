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

export type AuthUser = {
  id: string
  name: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => void
  retry: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // جلب الملف الشخصي من جدول Users
  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data: byAuth } = await supabase
        .from("Users")
        .select("id, name, email, is_admin")
        .eq("auth_id", userId)
        .maybeSingle()

      if (byAuth) {
        setUser(byAuth as AuthUser)
        setError(null)
        return
      }

      if (email) {
        const { data: byEmail } = await supabase
          .from("Users")
          .select("id, name, email, is_admin, auth_id")
          .eq("email", email)
          .maybeSingle()

        if (byEmail) {
          if (byEmail.auth_id) {
            setUser(null)
            setError("هذا الحساب مرتبط بجلسة أخرى.")
            return
          }

          const { error: updateError } = await supabase
            .from("Users")
            .update({ auth_id: userId })
            .eq("id", byEmail.id)

          if (updateError) throw updateError

          setUser({
            id: byEmail.id,
            name: byEmail.name,
            email: byEmail.email,
            is_admin: byEmail.is_admin,
          })
          setError(null)
          return
        }
      }

      setUser(null)
      setError("لم يتم منحك صلاحية بعد. يرجى التواصل مع مدير النظام.")
    } catch (err: any) {
      console.error("❌ خطأ في جلب الملف الشخصي:", err)
      setUser(null)
      setError("حدث خطأ أثناء التحقق من الصلاحية.")
    }
  }, [])

  // إعادة المحاولة
  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const ses = data.session
        setSession(ses)
        if (ses?.user) {
          return fetchProfile(ses.user.id, ses.user.email)
        } else {
          setUser(null)
        }
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [fetchProfile])

  // التهيئة الأولى
  useEffect(() => {
    let mounted = true
    setLoading(true)

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        const ses = data.session
        setSession(ses)
        if (ses?.user) {
          return fetchProfile(ses.user.id, ses.user.email)
        } else {
          setUser(null)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return
        setSession(newSession)
        setLoading(false)

        if (newSession?.user) {
          fetchProfile(newSession.user.id, newSession.user.email)
        } else {
          setUser(null)
          setError(null)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  // 🚀 تسجيل الدخول عبر Google
  const signInWithGoogle = useCallback(async () => {
    const origin = window.location.origin
      .replace(/:80$/, "")
      .replace(/:443$/, "")

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }, [])

  const signOut = useCallback(() => {
    supabase.auth.signOut().catch(console.error)
    setSession(null)
    setUser(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signInWithGoogle,
        signOut,
        retry,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
