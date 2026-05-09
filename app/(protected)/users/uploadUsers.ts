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

// توليد كلمة مرور عشوائية حقيقية — لا علاقة لها بالجوال
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => chars[b % chars.length])
    .join("")
  return random + "@in"
}

// التحقق من أن المستدعي مدير — يُستدعى في أول كل دالة
async function assertIsAdmin() {
  const cookieStore = cookies()
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: async (n) => (await cookieStore).get(n)?.value } }
  )

  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) throw new Error("غير مصرح")

  const { data } = await client
    .from("Users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (data?.role !== "مدير") throw new Error("غير مصرح")
}

export type UserInput = {
  name: string
  email: string
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

  const password = generatePassword()
  const internalEmail = `${data.email}@internal.system`

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
    if (
      authError.message.includes("already exists") ||
      authError.message.includes("users_email_key")
    ) {
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
      email: data.email,
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
