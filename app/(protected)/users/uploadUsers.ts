// uploadUsers.ts
"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { User } from "@/hooks/useUsers"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// دالة مساعدة لتنظيف رقم الجوال كما في AuthContext
function cleanPhone(phone: string): string {
  return phone.trim().replace(/\D/g, "")
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => chars[b % chars.length])
    .join("")
  return random + "@in"
}

/**
 * التحقق من الإدارة - تم تحديثها لتتوافق مع Next.js 15/16
 * وتطبيق نفس منطق الحماية في AuthContext
 */
async function assertIsAdmin() {
  try {
    const cookieStore = await cookies()

    // إعداد العميل بشكل يضمن قراءة الكوكيز بشكل صحيح في Next.js الحديث
    const client = createServerClient(
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
              // تجاهل الخطأ إذا تم استدعاؤه من مكون سيرفر
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser()

    if (authError || !user) {
      console.error("🔍 فشل التحقق من الجلسة:", authError)
      throw new Error("لا يوجد مستخدم مسجل")
    }

    // تطبيق حماية AuthContext: التحقق عبر auth_id والبحث في جدول Users
    const { data, error: dbError } = await client
      .from("Users")
      .select("role, is_admin")
      .eq("auth_id", user.id)
      .maybeSingle() // أمن من single() في حال عدم وجود السجل

    console.log("🔍 صلاحيات المستخدم:", data)

    if (dbError || !data) {
      throw new Error("لم يتم العثور على بيانات الصلاحيات")
    }

    // التحقق المزدوج (الرتبة أو علامة المدير)
    if (data.role !== "مدير" && !data.is_admin) {
      throw new Error("ليس مديراً")
    }
  } catch (err) {
    console.error("❌ assertIsAdmin فشل:", err)
    throw err
  }
}

export type UserInput = {
  name: string
  email: string // هنا يمثل رقم الجوال
  is_admin?: boolean
  role?: "مدير" | "مشرف" | "مخصص"
  permissions?: any
}

export async function createUserWithPhone(
  data: UserInput
): Promise<User & { generatedPassword: string }> {
  await assertIsAdmin()

  if (!data.name?.trim()) throw new Error("اسم المستخدم مطلوب")
  if (!data.email?.trim()) throw new Error("رقم الجوال مطلوب")

  // تطبيق حماية AuthContext: تنظيف الرقم قبل المعالجة
  const phoneNumber = cleanPhone(data.email)
  const password = generatePassword()
  const internalEmail = `${phoneNumber}@internal.system`

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role ?? "مخصص",
      },
    })

  if (authError) {
    if (authError.message.includes("already exists")) {
      throw new Error("هذا الرقم مسجل بالفعل")
    }
    throw new Error("فشل إنشاء الحساب: " + authError.message)
  }

  const auth_id = authData.user.id

  const { data: newUser, error: dbError } = await supabaseAdmin
    .from("Users")
    .insert({
      auth_id,
      name: data.name,
      email: phoneNumber, // تخزين الرقم النظيف
      role: data.role ?? "مخصص",
      is_admin: data.is_admin ?? false,
      permissions: data.permissions ?? {},
    })
    .select()
    .single()

  if (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(auth_id)
    throw new Error("فشل حفظ بيانات المستخدم: " + dbError.message)
  }

  return { ...(newUser as User), generatedPassword: password }
}

export async function updateUser(
  auth_id: string,
  data: Partial<UserInput>
): Promise<User> {
  await assertIsAdmin()

  if (!auth_id) throw new Error("معرف المستخدم مطلوب")

  const { data: updatedUser, error } = await supabaseAdmin
    .from("Users")
    .update(data)
    .eq("auth_id", auth_id)
    .select()
    .single()

  if (error) throw new Error("فشل تحديث المستخدم: " + error.message)

  return updatedUser as User
}

export async function deleteUser(auth_id: string): Promise<void> {
  await assertIsAdmin()

  if (!auth_id) throw new Error("معرف المستخدم مطلوب")

  const { error } = await supabaseAdmin.auth.admin.deleteUser(auth_id)

  if (error) throw new Error("فشل حذف المستخدم: " + error.message)
}

export async function resetUserPassword(auth_id: string): Promise<string> {
  await assertIsAdmin()

  if (!auth_id) throw new Error("معرف المستخدم مطلوب")

  const newPassword = generatePassword()

  const { error } = await supabaseAdmin.auth.admin.updateUserById(auth_id, {
    password: newPassword,
  })

  if (error) throw new Error("فشل إعادة التعيين: " + error.message)

  return newPassword
}
