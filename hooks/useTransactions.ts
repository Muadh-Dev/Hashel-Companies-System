// useTransactions.ts
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export type Transaction = {
  id: string
  resident_name: string
  iqama_number: string
  nationality: string
  profession: string
  expiry_date: string | null
  payment_date: string | null
  unified_number_of_company: string
  companies: {
    establishment_number: string
    social_insurance_number: string
  } | null
  memo_number: string | null
  service_type: string
  work_permit: number
  passports: number
  phone_num: number
  medical_insurance: number
  transport_fees: number
  other_fees: number
  agreed_amount: number
  received_amount: number
  pay_state: string
  note: string
  created_at: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("transactions")
        .select("*, companies(establishment_number,social_insurance_number)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب البيانات:", error)
        setTransactions([])
      } else {
        setTransactions(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // تعديل الدالة لإصلاح خطأ prev وتغيير الاسم كما طلبت
  const removeTransLocal = (id: string) => {
    setTransactions((prev) =>
      prev ? prev.filter((item) => item.id !== id) : null
    )
  }

  return { transactions, loading, removeTransLocal }
}
