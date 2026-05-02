"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

interface UseUpsertOptions {
  table: string
  conflictColumn: string
  stripFields?: string[]
  onSuccess?: () => void | Promise<void>
}

// تعديل حجم الدفعة حسب عدد الأعمدة وحجم البيانات (500 رقم آمن جداً)
const CHUNK_SIZE = 500

export function useUpsert<T extends Record<string, any>>({
  table,
  conflictColumn,
  stripFields = ["id", "created_at"],
  onSuccess,
}: UseUpsertOptions) {
  const [loading, setLoading] = useState(false)

  // أضفنا onProgress كمعامل ثانٍ هنا ليتوافق مع ما يرسله ExcelImporter
  const upsert = useCallback(
    async (
      data: Partial<T>[],
      onProgress?: (done: number, total: number) => void
    ): Promise<void> => {
      if (!data.length) {
        toast.warning("لا توجد بيانات للاستيراد")
        return
      }

      setLoading(true)
      try {
        const cleanData = data.map((row) => {
          const cleaned = { ...row }
          for (const field of stripFields) delete cleaned[field]
          return cleaned
        })

        const totalRows = cleanData.length
        let processedRows = 0

        // تقسيم البيانات وإرسالها على دفعات
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

          // تحديث شريط التقدم الفعلي
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
    [table, conflictColumn, stripFields, onSuccess]
  )

  return { upsert, loading }
}
