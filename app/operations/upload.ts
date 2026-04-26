// upload.ts
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export async function addTransaction(data: any) {
  const { error } = await supabase.from("transactions").insert({
    resident_name: data.residentName,
    phone_num: data.phone_num,
    iqama_number: data.iqamaNumber,
    nationality: data.nationality,
    profession: data.profession,
    payment_date: data.payment_date,
    expiry_date: data.expiryDate,
    unified_number_of_company: "7051022502",
    memo_number: data.memoNumber,
    service_type: data.serviceType,
    work_permit: data.workPermit,
    passports: data.passports,
    medical_insurance: data.medicalInsurance,
    transport_fees: data.transportFees,
    other_fees: data.otherFees,
    agreed_amount: data.agreedAmount,
    received_amount: data.receivedAmount,
    pay_state: data.payState,
  })

  if (error) throw error
}

// أضف هذه الدالة في نهاية ملف upload.ts
export async function deleteTransactions(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) throw error
}
