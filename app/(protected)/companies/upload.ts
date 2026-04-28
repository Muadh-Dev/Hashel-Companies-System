import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { Company } from "@/hooks/useCompanies"

export type CompanyInput = {
  unified_number: string
  establishment_number: string
  social_insurance_number: string
  company_owner: string
  entity_type: string
  crNumber: number
  cr_expiry_date: string | null
  government_fees: number
  commercial_register_fees: number
  qiwa: number
  muqeem: number
  newspaper_price: number
  exemption_amount: number
}

function calculateTotalCosts(data: {
  government_fees: number
  commercial_register_fees: number
  qiwa: number
  muqeem: number
  newspaper_price: number
}) {
  return (
    (data.government_fees || 0) +
    (data.commercial_register_fees || 0) +
    (data.qiwa || 0) +
    (data.muqeem || 0) +
    (data.newspaper_price || 0)
  )
}

export async function addCompany(data: CompanyInput): Promise<Company> {
  if (!data.unified_number?.trim()) throw new Error("الرقم الموحد مطلوب")
  if (!data.company_owner?.trim()) throw new Error("اسم مالك الشركة مطلوب")

  const total_costs = calculateTotalCosts(data)

  const { data: company, error } = await supabase
    .from("companies")
    .insert([{ ...data, total_costs }])
    .select("*")
    .single()

  if (error) throw error
  if (!company) throw new Error("فشل إضافة الشركة")

  return company
}

export async function updateCompany(
  id: string,
  data: Partial<CompanyInput>
): Promise<Company> {
  if (!id) throw new Error("معرف الشركة مطلوب")

  const updateData: any = { ...data }

  // إذا تغيرت أي من مكونات التكاليف، نحسب الإجمالي الجديد
  if (
    data.government_fees !== undefined ||
    data.commercial_register_fees !== undefined ||
    data.qiwa !== undefined ||
    data.muqeem !== undefined ||
    data.newspaper_price !== undefined
  ) {
    // نجلب القيم الحالية لتكملة الحقول الناقصة
    const { data: existing } = await supabase
      .from("companies")
      .select(
        "government_fees, commercial_register_fees, qiwa, muqeem, newspaper_price"
      )
      .eq("id", id)
      .single()

    if (existing) {
      updateData.total_costs = calculateTotalCosts({
        government_fees: data.government_fees ?? existing.government_fees,
        commercial_register_fees:
          data.commercial_register_fees ?? existing.commercial_register_fees,
        qiwa: data.qiwa ?? existing.qiwa,
        muqeem: data.muqeem ?? existing.muqeem,
        newspaper_price: data.newspaper_price ?? existing.newspaper_price,
      })
    }
  }

  const { data: company, error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  if (!company) throw new Error("فشل تحديث الشركة")

  return company
}

export async function deleteCompany(id: string): Promise<void> {
  if (!id) throw new Error("معرف الشركة مطلوب")
  const { error } = await supabase.from("companies").delete().eq("id", id)
  if (error) throw error
}
