"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  // ⛑️ أثناء التصيير الخادمي (SSR) – نُعيد عميلاً وهمياً ولكن **مطابقاً لنوع SupabaseClient**
  if (typeof window === "undefined") {
    // الدوال الوهمية التي تُطابق توقيع النوع تماماً
    const dummyAuth = {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: (event: any, session: any) => void) => {
        // لا يحدث أي تغيير حقيقي
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ error: null }),
      exchangeCodeForSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
    }

    // واجهة from() الوهمية التي تُرجع سلاسل وهمية
    const dummyQueryBuilder = new Proxy(
      {},
      {
        get: (_, prop) => {
          if (prop === "then") return undefined // لتجنب مشاكل الـ Promise-like
          return () => dummyQueryBuilder
        },
      }
    ) as any

    const dummyFrom = (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        ...dummyQueryBuilder,
      }),
      insert: (values: any) => dummyQueryBuilder,
      update: (values: any) => dummyQueryBuilder,
      delete: () => dummyQueryBuilder,
    })

    // تجميع العميل الوهمي وإجبار TypeScript على قبوله
    const dummyClient = {
      auth: dummyAuth,
      from: dummyFrom,
      storage: {},
      // يمكن إضافة خصائص أخرى عند الحاجة
    } as unknown as SupabaseClient

    return dummyClient
  }

  // ✨ في المتصفح – أنشئ العميل الحقيقي مرة واحدة
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export const supabase = getSupabase()
