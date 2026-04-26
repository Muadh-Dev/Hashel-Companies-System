"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(prevState: { error: string }, formData: FormData) {
  console.log("🔐 [login] Action called")

  const supabase = await createClient()
  console.log("🔧 [login] Supabase client created")

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  console.log("📧 [login] Attempting login for:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("❌ [login] Error:", error.message)
    if (error.message.includes("Invalid login credentials")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." }
    }
    return { error: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً." }
  }

  console.log("✅ [login] Login successful, user:", data.user?.email)
  console.log("🔄 [login] Revalidating path and redirecting to /")
  revalidatePath("/", "layout")
  redirect("/")
}
