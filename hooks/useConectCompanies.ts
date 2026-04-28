// useConectCompanies.ts
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

// تصدير النوع بشكل صحيح لكي نستخدمه في باقي المكونات
export type Companys = {
  id?: string // أضفت الـ id لأنه ضروري كمفتاح (Key) في الـ React
  com1: number
  com2: number
  created_at?: string
}

export function useConectCompanies() {
  const [conectCompanies, setConectCompanies] = useState<Companys[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("conectCompanies")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("خطأ في جلب بيانات الشركات:", error)
        toast.error("خطأ في جلب بيانات الشركات تحقق من إتصالك بالإنترنت!", {
          position: "top-center",
        })
        setConectCompanies([])
      } else {
        setConectCompanies(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // دالة لتحديث الجدول فوراً بعد إضافة ربط جديد من الـ Modal
  const addCompanyLocal = (newCompany: Companys) => {
    setConectCompanies((prev) => [newCompany, ...prev])
  }

  const removeCompanyLocal = (id: string) => {
    setConectCompanies((prev) => prev.filter((item) => item.id !== id))
  }

  return { conectCompanies, loading, addCompanyLocal, removeCompanyLocal }
}
