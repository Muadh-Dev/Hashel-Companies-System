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
  auth_id: string // ← UUID من Supabase Auth — هذا هو المعرّف الوحيد
  name: string
  email: string // رقم الجوال فقط بدون @internal.system
  is_admin: boolean
  role?: "مدير" | "مشرف" | "مخصص"
  permissions?: {
    companies: "none" | "view" | "edit"
    linking: "none" | "view" | "edit"
    bankBalance: "none" | "view" | "edit"
    sponsorshipTransfer: "none" | "view" | "edit"
    visaIssuance: "none" | "view" | "edit"
    annualRenewal: "none" | "view" | "edit"
  }
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => void
  retry: () => void
  signInWithPhone: (phone: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * جلب بيانات المستخدم من جدول Users عبر auth_id فقط
   * auth_id هو UUID من Supabase Auth — الوحيد الموثوق
   */
  const fetchProfile = useCallback(async (auth_id: string) => {
    try {
      const { data, error: dbError } = await supabase
        .from("Users")
        .select("auth_id, name, email, is_admin, role, permissions")
        .eq("auth_id", auth_id)
        .maybeSingle()

      if (dbError) throw dbError

      if (data) {
        setUser({
          auth_id: data.auth_id,
          name: data.name,
          email: data.email, // الجوال فقط
          is_admin: data.is_admin,
          role: data.role,
          permissions: data.permissions,
        })
        setError(null)
      } else {
        // الحساب موجود في Auth لكن غير موجود في جدول Users
        setUser(null)
        setError("لم يتم منحك صلاحية. تواصل مع مدير النظام.")
      }
    } catch (err: any) {
      console.error("❌ خطأ في جلب الملف الشخصي:", err)
      setUser(null)
      setError("حدث خطأ أثناء التحقق من الصلاحية.")
    }
  }, [])

  // التهيئة الأولى عند تحميل التطبيق
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
          return fetchProfile(ses.user.id)
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

    // الاستماع لأي تغيير في حالة الجلسة (دخول / خروج)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return
        setSession(newSession)

        if (newSession?.user) {
          fetchProfile(newSession.user.id).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setUser(null)
          setError(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  // إعادة محاولة جلب البيانات يدوياً
  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const ses = data.session
        setSession(ses)
        if (ses?.user) {
          return fetchProfile(ses.user.id)
        } else {
          setUser(null)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [fetchProfile])

  /**
   * تسجيل الدخول برقم الجوال وكلمة المرور
   * يحول الرقم تلقائياً إلى إيميل وهمي لنظام Supabase Auth
   */
  const signInWithPhone = useCallback(
    async (phone: string, password: string) => {
      setLoading(true)
      setError(null)

      // تنظيف الرقم من أي مسافات أو شرطات أو أحرف غير رقمية
      const cleanPhone = phone.trim().replace(/\D/g, "")
      const fakeEmail = `${cleanPhone}@internal.system`

      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        })

        if (authError) throw authError
        // ✅ لا تضع setLoading(false) هنا
        // onAuthStateChange سيستدعي fetchProfile ويضع setLoading(false) تلقائياً
      } catch (err: any) {
        setError("رقم الجوال أو كلمة المرور غير صحيحة")
        setLoading(false)
        throw err // لإظهار toast في صفحة تسجيل الدخول
      }
    },
    []
  )

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
        signInWithPhone,
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
