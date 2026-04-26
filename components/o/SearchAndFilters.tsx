"use client"

import { Search, ArrowUpDown, Eye, EyeOff } from "lucide-react"

const SERVICE_TYPES = ["نقل كفالة", "إصدار تأشيرة", "تجديد سنوي"]

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

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  activeTab,
  onTabChange,
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
            placeholder="ابحث بالاسم، رقم الإقامة، رقم المنشأة، رقم المذكرة والرقم الموحد..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-lg shadow-sm transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="h-14 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white pr-10 pl-4 font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="date">فرز حسب: تاريخ المعاملة</option>
              <option value="expiry">فرز حسب: انتهاء الإقامة</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            onClick={onSortOrderToggle}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="تغيير اتجاه الترتيب"
          >
            {sortOrder === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["الكل", ...SERVICE_TYPES].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`rounded-xl px-6 py-2.5 font-bold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
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
