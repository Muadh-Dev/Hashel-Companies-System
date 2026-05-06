"use client"

import { Calendar, Square, CheckSquare } from "lucide-react"
import CompanyRow from "./CompanyRow"
import { Company } from "@/hooks/useCompanies"

type ProcessedCompany = Company & {
  operationDate: string
  daysRemaining: number
  remainingAmount: number
}

type Props = {
  data: ProcessedCompany[]
  showExpanded: boolean
  sortBy: "date" | "expiry"
  setSortBy: (val: "date" | "expiry") => void
  onEditRequest: (item: Company) => void
  onDeleteRequest: (item: Company) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string, event?: React.MouseEvent) => void
  onToggleSelectAll: () => void
  selectAll: boolean
}

export default function TransactionTableCompanies({
  data,
  showExpanded,
  setSortBy,
  onEditRequest,
  onDeleteRequest,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  selectAll,
}: Props) {
  const allSelected = data.length > 0 && selectAll

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/50 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
      <table className="border-collapse text-right whitespace-nowrap transition-all duration-300">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            {/* عمود التحديد */}
            <th className="w-12 border-l border-slate-200 p-4 dark:border-slate-700/50">
              <div className="flex items-center justify-center">
                <button
                  onClick={onToggleSelectAll}
                  className="group relative flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 transition-all hover:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-slate-600 dark:hover:border-blue-400"
                  aria-label={allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-blue-600 transition-transform group-active:scale-90 dark:text-blue-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400 transition-transform group-active:scale-90 dark:text-slate-500" />
                  )}
                </button>
              </div>
            </th>

            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setSortBy("date")}
              >
                <Calendar className="h-4 w-4" /> الرقم الموحد
              </div>
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              رقم المنشأة
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              رقم التأمينات
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              ملاك الشركة
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              نوع الكيان
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              رقم السجل التجاري
            </th>

            {showExpanded && (
              <>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  تاريخ انتهاء السجل التجاري
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  النشر في صحف الأعمال
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  الرسوم الحكومية
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  رسوم السجل التجاري
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  قوى
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  مقيم
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  اعفاء
                </th>
              </>
            )}

            <th className="border-l border-slate-200 p-4 font-bold text-emerald-600 dark:border-slate-700/50 dark:text-emerald-400">
              إجمالي التكاليف
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              عدد نقل كفالة
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              عدد إصدار التأشيرات
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              عدد الموظفين
            </th>

            <th className="sticky left-0 z-10 bg-slate-50 p-4 text-center font-bold shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:bg-slate-800">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {data.map((item) => (
            <CompanyRow
              key={item.id}
              item={item}
              showExpanded={showExpanded}
              onEditRequest={onEditRequest}
              onDeleteRequest={onDeleteRequest}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={(e) => onToggleSelect(item.id, e)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
