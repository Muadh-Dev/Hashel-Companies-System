// lib/uploadUsers.ts
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { User } from "@/hooks/useUsers"

export type UserInput = {
  name: string
  email: string // هنا يمثل رقم الجوال
  is_admin?: boolean
  role?: "مدير" | "مشرف" | "مخصص"
  permissions?: any
}

/**
 * إنشاء مستخدم جديد "بإيهام" النظام باستخدام رقم الجوال كإيميل
 * وتخزين كلمة المرور بنص صريح في جدول Users
 */
export async function createUserWithPhone(
  data: UserInput & { password: string }
): Promise<User> {
  if (!data.name?.trim()) throw new Error("اسم المستخدم مطلوب")
  if (!data.email?.trim()) throw new Error("رقم الجوال مطلوب")
  if (!data.password?.trim()) throw new Error("كلمة المرور مطلوبة")

  // إعداد الإيميل الوهمي داخلياً
  const internalEmail = `${data.email}@internal.system`

  // استدعاء دالة الـ RPC
  const { data: newUserId, error } = await supabase.rpc("create_user_via_rpc", {
    p_phone_email: internalEmail,
    p_password: data.password,
    p_name: data.name,
    p_role: data.role ?? "مخصص",
    p_is_admin: data.is_admin ?? false,
    p_permissions: data.permissions ?? {},
  })

  if (error) {
    if (error.message.includes("users_email_key"))
      throw new Error("هذا الرقم مسجل بالفعل")
    throw new Error("فشل إنشاء الحساب: " + error.message)
  }

  // إرجاع الكائن ليتطابق مع نوع User
  return {
    id: newUserId,
    name: data.name,
    email: data.email, // نرجع الجوال كما هو للواجهة
    role: data.role ?? "مخصص",
    is_admin: data.is_admin ?? false,
    permissions: data.permissions,
  } as User
}

/**
 * تحديث بيانات المستخدم في جدول Users
 */
export async function updateUser(
  id: string,
  data: Partial<UserInput>
): Promise<User> {
  if (!id) throw new Error("معرف المستخدم مطلوب")

  const { data: updatedUser, error } = await supabase
    .from("Users")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return updatedUser as User
}

/**
 * الحذف الكامل والنهائي من نظام Auth ومن جدول Users
 */
export async function deleteUser(id: string): Promise<void> {
  if (!id) throw new Error("معرف المستخدم مطلوب")

  // استدعاء دالة الحذف عبر RPC لضمان حذف المستخدم من نظام المصادقة أيضاً
  const { error } = await supabase.rpc("delete_user_via_rpc", {
    p_user_id: id,
  })

  if (error) throw new Error("فشل حذف المستخدم: " + error.message)
}
