import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { Companys } from "@/hooks/useConectCompanies"

export async function conectCompanies(data: Companys) {
  const { data: insertedData, error } = await supabase
    .from("conectCompanies")
    .insert({
      com1: data.com1,
      com2: data.com2,
    })
    .select() // لإرجاع العنصر المُضاف مع الـ ID الخاص به
    .single()

  if (error) throw error
  return insertedData
}

// أضف هذه الدالة في نهاية ملف upload.ts
export async function deleteConectCompany(id: string) {
  const { error } = await supabase.from("conectCompanies").delete().eq("id", id)

  if (error) throw error
}
