import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      user: data.user,
    })
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ في السيرفر" }, { status: 500 })
  }
}
