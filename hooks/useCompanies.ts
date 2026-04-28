"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

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
  employees_count: number
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("خطأ في جلب بيانات الشركات:", error)
      toast.error("خطأ في جلب بيانات الشركات", { position: "top-center" })
      setCompanies([])
    } else {
      setCompanies(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const addCompanyLocal = useCallback((newCompany: Company) => {
    setCompanies((prev) => [newCompany, ...prev])
  }, [])

  const updateCompanyLocal = useCallback((updatedCompany: Company) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === updatedCompany.id ? updatedCompany : company
      )
    )
  }, [])

  const removeCompanyLocal = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id))
  }, [])

  return {
    companies,
    loading,
    addCompanyLocal,
    updateCompanyLocal,
    removeCompanyLocal,
    refetch: fetchCompanies,
  }
}
