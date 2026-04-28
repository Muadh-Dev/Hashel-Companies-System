"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  // في بيئة الخادم (SSR) نُعيد عميلًا وهميًا لا يقوم بشيء،
  // لأن كل استدعاءات Supabase الفعلية تحدث داخل useEffect في المتصفح فقط
  if (typeof window === "undefined") {
    // Dummy client يمنع أي خطأ وقت التصيير على الخادم
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: () => Promise.resolve(),
        signInWithOAuth: () => Promise.resolve(),
        exchangeCodeForSession: () =>
          Promise.resolve({ data: {}, error: null }),
      },
      from: () => {
        // إرجاع سلسلة دوال وهمية للتعامل مع الاستعلامات التي قد تُستدعى على الخادم
        const chain = new Proxy(
          {},
          {
            get: () => () => chain,
          }
        )
        // توفير simple select / eq / maybeSingle وغيرها
        return {
          select: () => chain,
          insert: () => chain,
          update: () => chain,
          delete: () => chain,
          eq: () => chain,
          maybeSingle: () => chain,
          single: () => chain,
          then: (fn: any) =>
            Promise.resolve({ data: null, error: null }).then(fn),
        } as any
      },
      storage: {},
      // أي خصائص أخرى يمكن إضافتها حسب الحاجة
    } as any
  }

  // في المتصفح – إنشاء العميل الحقيقي مرة واحدة
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// نفس التصدير الذي تستخدمه جميع الملفات
export const supabase = getSupabase()
