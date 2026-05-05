import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"
import { useUpsert } from "@/components/ExcelImporter/useUpsert"

export type Company = {
  establishment_number: string
  social_insurance_number: string
}

export type Transaction = {
  id: string
  resident_name: string
  Wresident_name: string
  iqama_number: string
  Wiqama_number: string
  nationality: string
  profession: string
  expiry_date: string | null
  payment_date: string | null
  unified_number_of_company: string
  companies: Company | null
  memo_number: string | null
  service_type: string
  work_permit: number
  passports: number
  phone_num: number
  Wphone_num: number
  iqama: number
  medical_insurance: number
  transport_fees: number
  other_fees: number
  agreed_amount: number
  received_amount: number
  note: string
  created_at: string
  working: string
  tashira_number: string
  hodod_number: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── جلب البيانات (محسن باستخدام useCallback) ──────────────────────────
  const fetchTransactions = useCallback(async () => {
    setFetching(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("*, companies(establishment_number, social_insurance_number)")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setTransactions(data || [])
    } catch (err) {
      console.error("[useTransactions] fetch error:", err)
      const msg = err instanceof Error ? err.message : "حدث خطأ في جلب البيانات"
      setError(msg)
      toast.error(msg, { position: "top-center" })
      setTransactions([])
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // ── هوك الاستيراد الجنيريك ──────────────────────────────────────────
  const { upsert, loading: upserting } = useUpsert<Transaction>({
    table: "transactions",
    conflictColumn: "id", // أو iqama_number حسب منطق قاعدة البيانات لديك
    onSuccess: fetchTransactions,
  })

  // ── تحديثات محلية (Optimistic UI) ──────────────────────────────────
  const addTransactionLocal = useCallback((newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev])
  }, [])

  const updateTransactionLocal = useCallback((updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    )
  }, [])

  const removeTransactionLocal = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── الحسابات (استخدام useMemo) ────────────────────────────────────
  const count = useMemo(() => transactions.length, [transactions])

  return {
    transactions,
    loading: fetching || upserting, // دمج حالة التحميل والرفع
    error,
    upsertTransactions: upsert, // إضافة دالة الاستيراد
    refetch: fetchTransactions,
    addTransactionLocal,
    updateTransactionLocal,
    removeTransactionLocal,
    count,
  }
}
