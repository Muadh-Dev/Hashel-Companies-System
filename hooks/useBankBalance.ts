"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

export type BankTransaction = {
  id?: string
  operation_date: string // YYYY-MM-DD
  operation: string
  description: string
  debit: number
  credit: number
  created_at?: string
}

export function useBankBalance() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("bank_balance")
        .select("*")
        .order("operation_date", { ascending: false })

      if (error) {
        console.error("خطأ في جلب العمليات البنكية:", error)
        toast.error("خطأ في جلب العمليات، تحقق من اتصالك بالإنترنت!")
        setTransactions([])
      } else {
        setTransactions(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const addTransactionLocal = (newTransaction: BankTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const removeTransactionLocal = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  return { transactions, loading, addTransactionLocal, removeTransactionLocal }
}
