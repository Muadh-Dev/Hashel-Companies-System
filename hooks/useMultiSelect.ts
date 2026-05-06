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
  // يحفظ آخر id تم النقر عليه (بدون shift)
  const lastClickedId = useRef<string | null>(null)

  useEffect(() => {
    setSelectedIds(new Set())
    setSelectAll(false)
    lastClickedId.current = null
  }, resetDependencies)

  const toggleItem = useCallback(
    (id: string, event?: React.MouseEvent) => {
      const shiftKey = event?.shiftKey ?? false

      setSelectedIds((prev) => {
        const next = new Set(prev)

        if (shiftKey && lastClickedId.current && lastClickedId.current !== id) {
          // نطاق بين آخر id وهذا id
          const ids = data.map(getItemId)
          const start = ids.indexOf(lastClickedId.current)
          const end = ids.indexOf(id)
          if (start !== -1 && end !== -1) {
            const from = Math.min(start, end)
            const to = Math.max(start, end)
            // نضيف النطاق كاملاً (إذا أردت السلوك البديل: إلغاء النطاق إذا كان id محدداً، لكن سألتزم بسلوك ويندوز: shift+click يضيف النطاق)
            for (let i = from; i <= to; i++) {
              next.add(ids[i])
            }
          }
        } else {
          // نقر عادي: toggle واحد
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          lastClickedId.current = id // نسجل آخر نقرة فقط للنقرات الفردية
        }

        setSelectAll(next.size === data.length && data.length > 0)
        return next
      })
    },
    [data, getItemId]
  )

  const toggleAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set())
      setSelectAll(false)
    } else {
      setSelectedIds(new Set(data.map(getItemId)))
      setSelectAll(true)
    }
  }, [selectAll, data, getItemId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectAll(false)
    lastClickedId.current = null
  }, [])

  return {
    selectedIds,
    selectAll,
    toggleItem,
    toggleAll,
    clearSelection,
    selectedCount: selectedIds.size,
    selectedArray: Array.from(selectedIds),
  }
}
