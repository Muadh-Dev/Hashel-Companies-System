"use client"

import { Search, ArrowUpDown, Eye, EyeOff } from "lucide-react"

type Props = {
  searchQuery: string
  onSearchChange: (val: string) => void
  sortBy: "date" | "expiry"
  onSortByChange: (val: "date" | "expiry") => void
  sortOrder: "asc" | "desc"
  onSortOrderToggle: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  showExpanded: boolean
  onToggleExpanded: () => void
}

export default function SearchAndFiltersCompany({
  searchQuery,
  onSearchChange,
  showExpanded,
  onToggleExpanded,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative md:col-span-2">
          <Search className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
          <input
            type="text"
            placeholder="ابحث بالرقم الموحد، رقم المنشأة، رقم التأمين، واسم الملاك..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-lg shadow-sm transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <button
          onClick={onToggleExpanded}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {showExpanded ? (
            <EyeOff className="h-5 w-5 text-blue-500" />
          ) : (
            <Eye className="h-5 w-5 text-blue-600" />
          )}
          <span>{showExpanded ? "إخفاء التفاصيل" : "إظهار كافة التفاصيل"}</span>
        </button>
      </div>
    </div>
  )
}
