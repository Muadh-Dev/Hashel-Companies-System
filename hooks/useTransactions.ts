import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

export type Company = {
  establishment_number: string
  social_insurance_number: string
}

export type Transaction = {
  id: string
  resident_name: string
  iqama_number: string
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
  medical_insurance: number
  transport_fees: number
  other_fees: number
  agreed_amount: number
  received_amount: number
  note: string
  created_at: string
  working: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("*, companies(establishment_number, social_insurance_number)")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setTransactions(data || [])
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ في جلب البيانات")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransactionLocal = useCallback((newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev])
  }, [])

  const removeTransactionLocal = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    )
  }, [])

  const updateTransactionLocal = useCallback(
    (updatedTransaction: Transaction) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction
        )
      )
    },
    []
  )

  return {
    transactions,
    loading,
    error,
    addTransactionLocal,
    removeTransactionLocal,
    updateTransactionLocal,
    refetch: fetchTransactions,
  }
}
