import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { User } from "@/hooks/useUsers"

export type UserInput = {
  id?: number // اختياري عند الإنشاء، ضروري عند التعديل
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

// إضافة مستخدم جديد
export async function addUser(data: UserInput): Promise<User> {
  if (!data.name?.trim()) throw new Error("اسم المستخدم مطلوب")
  if (!data.email?.trim()) throw new Error("الإيميل مطلوب")

  const insertData = {
    name: data.name,
    email: data.email,
    is_admin: data.is_admin ?? false,
    role: data.role ?? "مخصص",
    permissions: data.permissions ?? null,
  }

  const { data: user, error } = await supabase
    .from("Users")
    .insert([insertData])
    .select("id, auth_id, name, email, is_admin, created_at, role, permissions") // تأكد من جلب الـ id هنا
    .single()

  if (error) {
    if (error.code === "23505") throw new Error("الإيميل مستخدم بالفعل")
    throw error
  }
  return user as User
}

// تعديل مستخدم بناءً على الـ id
export async function updateUser(
  id: number | string, // المعرف الفريد في جدول Users
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
    .eq("id", id) // تم التغيير من auth_id إلى id
    .select("id, auth_id, name, email, is_admin, created_at, role, permissions")
    .single()

  if (error) throw error
  return user as User
}

// حذف مستخدم بناءً على الـ id
export async function deleteUser(id: number | string): Promise<void> {
  if (!id) throw new Error("معرف المستخدم مطلوب")

  const { error } = await supabase.from("Users").delete().eq("id", id) // يعتمد على id الجدول الأساسي

  if (error) throw error
}
