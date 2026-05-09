"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// العميل الإداري للعمليات التي تتطلب صلاحيات كاملة (مثل إنشاء المستخدمين)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * دالة التحقق من الصلاحية - مبنية على منطق AuthContext الخاص بك
 */
async function validateAdmin() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            /* تُتجاهل في مكونات السيرفر */
          }
        },
      },
    }
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user)
    throw new Error("جلسة العمل منتهية، يرجى إعادة تسجيل الدخول")

  // التحقق من قاعدة البيانات (جدول Users)
  const { data: profile, error: dbError } = await supabase
    .from("Users")
    .select("role, is_admin")
    .eq("auth_id", user.id)
    .single()

  if (dbError || !profile || (profile.role !== "مدير" && !profile.is_admin)) {
    throw new Error("ليس لديك صلاحية للقيام بهذا الإجراء")
  }

  return user.id
}

/**
 * إنشاء مستخدم جديد برقم الهاتف (نظام هاشل)
 */
export async function createUserAction(formData: {
  name: string
  phone: string
  role?: string
}) {
  await validateAdmin()

  // 1. تنظيف الرقم كما في AuthContext
  const cleanPhone = formData.phone.trim().replace(/\D/g, "")
  const internalEmail = `${cleanPhone}@internal.system`

  // 2. توليد كلمة مرور عشوائية
  const password = Math.random().toString(36).slice(-8) + "@Hashel"

  // 3. الإنشاء في Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { name: formData.name },
    })

  if (authError) throw new Error(`خطأ في نظام الهوية: ${authError.message}`)

  // 4. الحفظ في جدول Users
  const { error: dbError } = await supabaseAdmin.from("Users").insert({
    auth_id: authData.user.id,
    name: formData.name,
    email: cleanPhone, // تخزين الرقم النظيف فقط
    role: formData.role || "مخصص",
    is_admin: formData.role === "مدير",
  })

  if (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error(`خطأ في قاعدة البيانات: ${dbError.message}`)
  }

  revalidatePath("/users")
  return { success: true, password }
}

/**
 * حذف مستخدم
 */
export async function deleteUserAction(auth_id: string) {
  await validateAdmin()

  const { error } = await supabaseAdmin.auth.admin.deleteUser(auth_id)
  if (error) throw new Error(`فشل الحذف: ${error.message}`)

  revalidatePath("/users")
  return { success: true }
}
