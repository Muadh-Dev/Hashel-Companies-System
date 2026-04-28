// lib/uploadUsers.ts
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { User } from "@/hooks/useUsers"

export type UserInput = {
  name: string
  email: string
  is_admin: boolean
}

export async function addUser(data: UserInput): Promise<User> {
  if (!data.name?.trim()) throw new Error("اسم المستخدم مطلوب")
  if (!data.email?.trim()) throw new Error("الإيميل مطلوب")

  // نضيف مباشرة إلى جدول Users (بدون كلمة مرور)
  const { data: user, error } = await supabase
    .from("Users")
    .insert([
      {
        name: data.name,
        email: data.email,
        is_admin: data.is_admin,
      },
    ])
    .select("id, name, email, is_admin, created_at")
    .single()

  if (error) {
    if (error.code === "23505") throw new Error("الإيميل مستخدم بالفعل")
    throw error
  }
  return user as User
}

export async function updateUser(
  id: string,
  data: Partial<UserInput>
): Promise<User> {
  if (!id) throw new Error("معرف المستخدم مطلوب")

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.is_admin !== undefined) updateData.is_admin = data.is_admin

  const { data: user, error } = await supabase
    .from("Users")
    .update(updateData)
    .eq("id", id)
    .select("id, name, email, is_admin, created_at")
    .single()

  if (error) throw error
  return user as User
}

export async function deleteUser(id: string): Promise<void> {
  if (!id) throw new Error("معرف المستخدم مطلوب")
  const { error } = await supabase.from("Users").delete().eq("id", id)
  if (error) throw error
}
