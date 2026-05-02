"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"
import { useUpsert } from "@/components/ExcelImporter/useUpsert"

// تصدير النوع كما هو
export type Companys = {
  id?: string
  com1: number
  com2: number
  created_at?: string
}

export function useConectCompanies() {
  const [conectCompanies, setConectCompanies] = useState<Companys[]>([])
  const [fetching, setFetching] = useState(true)

  // ── جلب البيانات (محسن باستخدام useCallback) ──────────────────────────
  const fetchConectCompanies = useCallback(async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from("conectCompanies")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[useConectCompanies] fetch error:", error)
      toast.error("خطأ في جلب بيانات ربط الشركات", {
        position: "top-center",
      })
      setConectCompanies([])
    } else {
      setConectCompanies(data || [])
    }
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchConectCompanies()
  }, [fetchConectCompanies])

  // ── هوك الاستيراد (استخدام المسميات الصحيحة للجدول والأعمدة) ──────────────
  const { upsert, loading: upserting } = useUpsert<Companys>({
    table: "conectCompanies", // اسم الجدول الأصلي لديك
    conflictColumn: "id", // العمود المستخدم للتعارض، عادة id في جداول الربط
    onSuccess: fetchConectCompanies,
  })

  // ── تحديثات محلية (Optimistic UI) ──────────────────────────────────
  const addCompanyLocal = useCallback((newCompany: Companys) => {
    setConectCompanies((prev) => [newCompany, ...prev])
  }, [])

  const updateCompanyLocal = useCallback((updated: Companys) => {
    setConectCompanies((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
  }, [])

  const removeCompanyLocal = useCallback((id: string) => {
    setConectCompanies((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // ── الحسابات (استخدام useMemo) ────────────────────────────────────
  const count = useMemo(() => conectCompanies.length, [conectCompanies])

  return {
    conectCompanies,
    loading: fetching || upserting, // دمج حالتي التحميل
    upsertConectCompanies: upsert,
    refetch: fetchConectCompanies,
    addCompanyLocal,
    updateCompanyLocal,
    removeCompanyLocal,
    count,
  }
}
