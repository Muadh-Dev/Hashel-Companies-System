import { useState, useRef, useEffect, useCallback } from "react"

interface UseMultiSelectOptions<T> {
  data: T[]
  getItemId: (item: T) => string
  resetDependencies?: any[]
}

export function useMultiSelect<T>({
  data,
  getItemId,
  resetDependencies = [],
}: UseMultiSelectOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const lastClickedRef = useRef<string | null>(null)

  // مسح التحديد عند تغيير المعايير
  useEffect(() => {
    setSelectedIds(new Set())
    setSelectAll(false)
    lastClickedRef.current = null
  }, [...resetDependencies])

  // تحديد عنصر واحد مع دعم Shift+Click
  const toggleItem = useCallback(
    (id: string, event?: React.MouseEvent) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)

        if (event?.shiftKey && lastClickedRef.current) {
          console.log("Shift+Click detected!") // 👈 للتجربة
          const ids = data.map(getItemId)
          const startIdx = ids.indexOf(lastClickedRef.current)
          const endIdx = ids.indexOf(id)

          console.log("Range:", startIdx, "to", endIdx)

          if (startIdx !== -1 && endIdx !== -1) {
            const [from, to] =
              startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
            const range = ids.slice(from, to + 1)

            console.log("Selecting range:", range) // 👈 للتجربة

            if (next.has(id)) {
              range.forEach((r) => next.delete(r))
            } else {
              range.forEach((r) => next.add(r))
            }
          }
        } else {
          if (next.has(id)) {
            next.delete(id)
            console.log("Removed:", id) // 👈 للتجربة
          } else {
            next.add(id)
            console.log("Added:", id) // 👈 للتجربة
          }
        }

        setSelectAll(next.size === data.length && data.length > 0)
        return next
      })

      lastClickedRef.current = id
    },
    [data, getItemId]
  )

  // تحديد/إلغاء الكل
  const toggleAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set())
      setSelectAll(false)
    } else {
      setSelectedIds(new Set(data.map(getItemId)))
      setSelectAll(true)
    }
  }, [selectAll, data, getItemId])

  // مسح التحديد
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectAll(false)
    lastClickedRef.current = null
  }, [])

  // التحقق إذا كان العنصر محدداً
  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id)
    },
    [selectedIds]
  )

  return {
    selectedIds,
    selectAll,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    selectedCount: selectedIds.size,
    selectedArray: Array.from(selectedIds),
  }
}
