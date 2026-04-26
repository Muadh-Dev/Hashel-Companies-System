"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export type Company = {
  id: string
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
  total_costs: number
  transfers_count: number
  visas_count: number
  exemption_amount: number
  newspaper_price: number
  created_at: string
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب بيانات الشركات:", error)
        setCompanies([]) // تعيين مصفوفة فارغة بدلاً من null لتجنب مشاكل العرض
      } else {
        setCompanies(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return { companies, loading }
}
