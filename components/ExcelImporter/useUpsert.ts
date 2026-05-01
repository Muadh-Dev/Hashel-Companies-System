"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

// ============================================================
// هوك جنيريك — يعمل مع أي جدول في قاعدة البيانات
// الاستخدام:
//   const { upsert, loading } = useUpsert({
//     table: "employees",
//     conflictColumn: "employee_id",
//   })
// ============================================================

interface UseUpsertOptions {
  /** اسم الجدول في Supabase */
  table: string
  /** العمود الذي يُحسم عليه التعارض (UNIQUE column) */
  conflictColumn: string
  /** حقول تُحذف قبل الإرسال (الافتراضي: id, created_at) */
  stripFields?: string[]
  /** دالة تُستدعى بعد نجاح العملية (مثال: refetch) */
  onSuccess?: () => void | Promise<void>
}

export function useUpsert<T extends Record<string, any>>({
  table,
  conflictColumn,
  stripFields = ["id", "created_at"],
  onSuccess,
}: UseUpsertOptions) {
  const [loading, setLoading] = useState(false)

  const upsert = useCallback(
    async (data: Partial<T>[]): Promise<void> => {
      if (!data.length) {
        toast.warning("لا توجد بيانات للاستيراد")
        return
      }

      setLoading(true)
      try {
        // حذف الحقول غير المرغوبة من كل صف
        const cleanData = data.map((row) => {
          const cleaned = { ...row }
          for (const field of stripFields) delete cleaned[field]
          return cleaned
        })

        const { error } = await supabase.from(table).upsert(cleanData, {
          onConflict: conflictColumn,
          ignoreDuplicates: false,
        })

        if (error) {
          console.error(`[useUpsert:${table}]`, error)
          toast.error(`خطأ في الاستيراد: ${error.message}`, {
            position: "top-center",
          })
          throw error
        }

        toast.success(`تم استيراد ${data.length} سجل بنجاح ✓`, {
          position: "top-center",
        })

        await onSuccess?.()
      } finally {
        // setLoading(false) دائماً حتى في حالة الخطأ
        setLoading(false)
      }
    },
    [table, conflictColumn, stripFields, onSuccess]
  )

  return { upsert, loading }
}
