// lib/uploadUsers.ts
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { User } from "@/hooks/useUsers"

export type UserInput = {
  name: string
  email: string
  is_admin?: boolean
  role?: "مدير" | "مشرف" | "مخصص"
  permissions?: {
    companies?: "none" | "view" | "edit"
    linking?: "none" | "view" | "edit"
    bankBalance?: "none" | "view" | "edit"
    sponsorshipTransfer?: "none" | "view" | "edit"
    visaIssuance?: "none" | "view" | "edit"
    annualRenewal?: "none" | "view" | "edit"
  }
}

export async function createUserWithPhone(
  data: UserInput & { password: string }
): Promise<User> {
  if (!data.name?.trim()) throw new Error("اسم المستخدم مطلوب")
  if (!data.email?.trim()) throw new Error("رقم الجوال مطلوب")
  if (!data.password?.trim()) throw new Error("كلمة المرور مطلوبة")

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

  if (authError) {
    if (authError.message?.includes("already been registered")) {
      throw new Error("هذا الرقم مسجل بالفعل")
    }
    throw new Error("فشل إنشاء الحساب: " + authError.message)
  }

  if (!authData.user) throw new Error("فشل إنشاء الحساب")

  const insertData = {
    name: data.name,
    email: data.email,
    is_admin: data.is_admin ?? false,
    role: data.role ?? "مخصص",
    permissions: data.permissions ?? null,
    auth_id: authData.user.id,
    password: data.password,
  }

  const { data: profile, error: profileError } = await supabase
    .from("Users")
    .insert([insertData])
    .select(
      "id, name, email, is_admin, created_at, role, permissions, password"
    )
    .single()

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    if (profileError.code === "23505") throw new Error("الإيميل مستخدم بالفعل")
    throw profileError
  }

  return profile as User
}

export async function updateUser(
  id: string,
  data: Partial<UserInput>
): Promise<User> {
  if (!id) throw new Error("معرف المستخدم مطلوب")

  const updateData: Record<string, any> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.is_admin !== undefined) updateData.is_admin = data.is_admin
  if (data.role !== undefined) updateData.role = data.role
  if (data.permissions !== undefined) updateData.permissions = data.permissions

  const { data: user, error } = await supabase
    .from("Users")
    .update(updateData)
    .eq("id", id)
    .select(
      "id, name, email, is_admin, created_at, role, permissions, password"
    )
    .single()

  if (error) throw error
  return user as User
}

export async function deleteUser(id: string): Promise<void> {
  if (!id) throw new Error("معرف المستخدم مطلوب")
  const { error } = await supabase.from("Users").delete().eq("id", id)
  if (error) throw error
}
