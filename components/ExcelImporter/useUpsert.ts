"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

interface UseUpsertOptions {
  table: string
  conflictColumn: string
  stripFields?: string[]
  dateFields?: string[] // حقول التاريخ التي تحتاج معالجة خاصة
  onSuccess?: () => void | Promise<void>
}

const CHUNK_SIZE = 500

/**
 * دالة داخلية لتحويل قيم التاريخ القادمة من إكسل (بدون مكتبات خارجية)
 */
const parseExcelDate = (value: any): string | null => {
  if (value === undefined || value === null || value === "") return null

  // 1. إذا كانت القيمة كائن تاريخ (JS Date Object)
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    return value.toISOString().split("T")[0]
  }

  // 2. إذا كان الرقم التسلسلي للإكسل قادماً على شكل نص نحوله لرقم
  const numValue =
    typeof value === "string" && /^\d{5}$/.test(value.trim())
      ? Number(value)
      : value

  // 3. التعامل مع رقم إكسل التسلسلي (Serial Number)
  if (typeof numValue === "number") {
    // 25569 هو فارق الأيام بين إكسل وجافاسكريبت
    const date = new Date((numValue - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }
    return null
  }

  // 4. التعامل مع النصوص بالجافاسكريبت النقي (Regex Parsing)
  if (typeof value === "string") {
    const str = value.trim()

    // محاولة التقاط صيغة DD/MM/YYYY أو DD-MM-YYYY الشائعة عربياً
    const matchDDMMYYYY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (matchDDMMYYYY) {
      const day = matchDDMMYYYY[1].padStart(2, "0")
      const month = matchDDMMYYYY[2].padStart(2, "0")
      const year = matchDDMMYYYY[3]
      return `${year}-${month}-${day}`
    }

    // محاولة التقاط صيغة YYYY/MM/DD أو YYYY-MM-DD
    const matchYYYYMMDD = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
    if (matchYYYYMMDD) {
      const year = matchYYYYMMDD[1]
      const month = matchYYYYMMDD[2].padStart(2, "0")
      const day = matchYYYYMMDD[3].padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    // محاولة أخيرة عبر الجافاسكريبت الافتراضي (للتنسيقات المدعومة عالمياً)
    const fallbackDate = new Date(str)
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString().split("T")[0]
    }
  }

  return null
}

export function useUpsert<T extends Record<string, any>>({
  table,
  conflictColumn,
  stripFields = ["id", "created_at"],
  dateFields = ["expiry_date", "created_at", "transaction_date"], // افتراضياً
  onSuccess,
}: UseUpsertOptions) {
  const [loading, setLoading] = useState(false)

  const upsert = useCallback(
    async (
      data: Partial<T>[],
      onProgress?: (done: number, total: number) => void,
      extraData: Record<string, any> = {} // <--- NEW: Added extraData parameter
    ): Promise<void> => {
      if (!data.length) {
        toast.warning("لا توجد بيانات للاستيراد")
        return
      }

      setLoading(true)
      try {
        // خط الدفاع الثاني: تنظيف البيانات ومعالجة التواريخ
        const cleanData = data.map((row) => {
          const cleaned = { ...row, ...extraData }

          // 1. حذف الحقول غير المرغوب بها
          for (const field of stripFields) delete cleaned[field]

          // 2. معالجة حقول التاريخ المحددة
          for (const key in cleaned) {
            if (dateFields.includes(key)) {
              ;(cleaned as any)[key] = parseExcelDate((cleaned as any)[key])
            }
          }

          return cleaned
        })

        const totalRows = cleanData.length
        let processedRows = 0

        for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
          const chunk = cleanData.slice(i, i + CHUNK_SIZE)

          const { error } = await supabase.from(table).upsert(chunk, {
            onConflict: conflictColumn,
            ignoreDuplicates: false,
          })

          if (error) {
            console.error(`[useUpsert:${table}]`, error)
            toast.error(`خطأ في الاستيراد عند الصف ${i}: ${error.message}`, {
              position: "top-center",
            })
            throw error
          }

          processedRows += chunk.length
          onProgress?.(processedRows, totalRows)
        }

        toast.success(`تم استيراد ${totalRows} سجل بنجاح ✓`, {
          position: "top-center",
        })

        await onSuccess?.()
      } finally {
        setLoading(false)
      }
    },
    [table, conflictColumn, stripFields, dateFields, onSuccess]
  )

  return { upsert, loading }
}
