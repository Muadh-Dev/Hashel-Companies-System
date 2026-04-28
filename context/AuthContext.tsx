"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient" // ⚠️ تأكد أنه عميل متصفح (createBrowserClient)
import { useRouter } from "next/navigation"

export type AuthUser = {
  id: string
  name: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  retryAuthorization: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // جلب الملف الشخصي من جدول Users
  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      // أولاً: البحث بالسجل المربوط مسبقاً عبر auth_id
      const { data: byAuth } = await supabase
        .from("Users")
        .select("id, name, email, is_admin, auth_id")
        .eq("auth_id", userId)
        .maybeSingle()

      if (byAuth) {
        setUser({
          id: byAuth.id,
          name: byAuth.name,
          email: byAuth.email,
          is_admin: byAuth.is_admin,
        })
        setError(null)
        return
      }

      // ثانياً: إذا لم يوجد رابط، وكان لدينا البريد الإلكتروني (جوجل يعيده)
      if (email) {
        const { data: byEmail } = await supabase
          .from("Users")
          .select("id, name, email, is_admin, auth_id")
          .eq("email", email)
          .maybeSingle()

        if (byEmail) {
          if (byEmail.auth_id) {
            // حالة نادرة: البريد موجود لكن auth_id مختلف
            setUser(null)
            setError("هذا الحساب مرتبط بجلسة أخرى.")
            return
          }

          // ربط السجل الحالي بمعرّف المصادقة الجديد
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

      // لم يُعثر على سجل مطلقاً ← لا صلاحية
      setUser(null)
      setError("لم يتم منحك صلاحية بعد. يرجى التواصل مع مدير النظام.")
    } catch (err: any) {
      console.error("❌ خطأ في جلب البروفايل:", err)
      setUser(null)
      setError("حدث خطأ أثناء التحقق من الصلاحية.")
    }
  }, [])

  // إعادة المحاولة (لزر "المحاولة مرة أخرى")
  const retryAuthorization = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email)
      } else {
        setUser(null)
        setError(null)
      }
    } catch (err: any) {
      console.error("❌ خطأ في retryAuthorization:", err)
      setUser(null)
      setError("تعذرت إعادة المحاولة. تحقق من اتصالك.")
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  // تهيئة الجلسة عند التحميل
  useEffect(() => {
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email)
        } else {
          setUser(null)
          setError(null)
        }
      } catch (err: any) {
        console.error("❌ فشل تهيئة الجلسة:", err)
        setUser(null)
        setError("حدث خطأ أثناء تهيئة الجلسة.")
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // الاستماع لتغيرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // إعادة تعيين التحميل دفاعياً (لن يكون true عادة)
        setLoading(false)

        if (event === "SIGNED_OUT") {
          setUser(null)
          setError(null)
          return
        }

        try {
          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email)
          } else {
            setUser(null)
            setError(null)
          }
        } catch (err: any) {
          console.error("❌ خطأ في مستمع المصادقة:", err)
          setUser(null)
          setError("حدث خطأ غير متوقع.")
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchProfile])

  // تسجيل الدخول بـ Google
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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setError(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signOut,
        retryAuthorization,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
