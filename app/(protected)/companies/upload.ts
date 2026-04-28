import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { Company } from "@/hooks/useCompanies"
import { toast } from "sonner"

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
  // 1. التحقق من البيانات الأساسية
  if (!data.unified_number?.trim()) throw new Error("الرقم الموحد مطلوب")

  // 2. حساب التكاليف يدوياً قبل الإرسال
  const total_costs = calculateTotalCosts(data)

  // 3. بناء الـ Payload بدقة (هنا الحل)
  // قمنا باستبعاد id, created_at, و employees_count تماماً
  const payload = {
    unified_number: data.unified_number,
    establishment_number: data.establishment_number,
    social_insurance_number: data.social_insurance_number,
    company_owner: data.company_owner,
    entity_type: data.entity_type,
    crNumber: data.crNumber ? Number(data.crNumber) : null, // تحويل لرقم
    cr_expiry_date: data.cr_expiry_date || null,

    // تحويل كل الحقول المالية إلى أرقام لـتجنب خطأ 400
    government_fees: Number(data.government_fees || 0),
    commercial_register_fees: Number(data.commercial_register_fees || 0),
    qiwa: Number(data.qiwa || 0),
    muqeem: Number(data.muqeem || 0),
    newspaper_price: Number(data.newspaper_price || 0),
    exemption_amount: Number(data.exemption_amount || 0),
    total_costs: Number(total_costs || 0),

    // إذا كنت لا ترسل هذه الحقول حالياً، نضعها null أو 0
    transfers_count: 0,
    visas_count: 0,
  }

  // 4. تنفيذ الطلب
  const { data: company, error } = await supabase
    .from("companies")
    .insert([payload]) // إرسال المصفوفة التي تحتوي الكائن النظيف
    .select("*")
    .single()

  if (error) {
    console.error("Error details:", error.message, error.details)
    throw new Error(error.message)
  }

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

  if (error) {
    // Code 23503 = foreign key violation (عنده عمال مرتبطين)
    if (error.code === "23503") {
      toast.error(
        "لا يمكن حذف الشركة لأنها تحتوي على عمال مرتبطين. قم بنقل العمال أو حذفهم أولاً.",
        { position: "bottom-left" }
      )
    }
    throw error
  }
}
