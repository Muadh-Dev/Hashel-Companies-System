"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"
import { useUpsert } from "@/components/ExcelImporter/useUpsert"

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
  employees_count: number
  created_at: string
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [fetching, setFetching] = useState(true)

  // ── جلب البيانات ──────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[useCompanies] fetchCompanies:", error)
      toast.error("خطأ في جلب بيانات الشركات", { position: "top-center" })
      setCompanies([])
    } else {
      setCompanies(data ?? [])
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // ── هوك الاستيراد الجنيريك ──────────────────────────────
  const { upsert, loading: upserting } = useUpsert<Company>({
    table: "companies",
    conflictColumn: "unified_number",
    onSuccess: fetchCompanies, // يُحدّث القائمة تلقائياً بعد النجاح
  })

  // ── تحديثات محلية (للـ optimistic UI) ───────────────────
  const addCompanyLocal = useCallback(
    (company: Company) => setCompanies((prev) => [company, ...prev]),
    []
  )

  const updateCompanyLocal = useCallback(
    (updated: Company) =>
      setCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      ),
    []
  )

  const removeCompanyLocal = useCallback(
    (id: string) => setCompanies((prev) => prev.filter((c) => c.id !== id)),
    []
  )

  const totalVisas = useMemo(() => {
    return companies.reduce(
      (sum, company) => sum + (Number(company.visas_count) || 0),
      0
    )
  }, [companies])

  const totalTransfers = useMemo(() => {
    return companies.reduce(
      (sum, company) => sum + (Number(company.transfers_count) || 0),
      0
    )
  }, [companies])
  const totalEmployees = useMemo(() => {
    return companies.reduce(
      (sum, company) => sum + (Number(company.employees_count) || 0),
      0
    )
  }, [companies])

  const count = companies.length

  return {
    companies,
    loading: fetching || upserting,
    upsertCompanies: upsert,
    refetch: fetchCompanies,
    addCompanyLocal,
    updateCompanyLocal,
    removeCompanyLocal,
    totalTransfers,
    totalVisas,
    totalEmployees,
    count,
  }
}
