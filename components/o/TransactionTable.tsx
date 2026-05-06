"use client"

import { Calendar, CheckSquare, Hourglass, Square } from "lucide-react"
import TransactionRow from "./TransactionRow"
import { useMemo } from "react"
import { Transaction } from "@/hooks/useTransactions"

type Props = {
  data: (Transaction & {
    operationDate: string
    daysRemaining: number
    remainingAmount: number
  })[]
  onDeleteRequest: (item: Transaction) => void
  showExpanded: boolean
  sortBy: "date" | "expiry"
  setSortBy: (val: "date" | "expiry") => void
  onEditRequest: (item: Transaction) => void
  onAddPaymentRequest: (item: Transaction) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string, e: React.MouseEvent) => void
  onToggleSelectAll: () => void
  selectAll: boolean
}

export default function TransactionTable({
  data,
  showExpanded,
  onDeleteRequest,
  setSortBy,
  onEditRequest,
  onAddPaymentRequest,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  selectAll,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/50 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
      <table className="border-collapse text-right whitespace-nowrap transition-all duration-300">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <th className="w-12 p-4">
              <button onClick={onToggleSelectAll}>
                {selectAll ? <CheckSquare /> : <Square />}
              </button>
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setSortBy("date")}
              >
                <Calendar className="h-4 w-4" /> تاريخ العملية
              </div>
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              اسم المقيم
            </th>

            {showExpanded && (
              <>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم الإقامة
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم الحدود
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم التأشيرة
                </th>

                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  الجنسية
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  المهنة
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم الجوال
                </th>
              </>
            )}

            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              نوع الخدمة
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              انتهاء الإقامة
            </th>
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setSortBy("expiry")}
              >
                <Hourglass className="h-4 w-4" /> المتبقي (أيام)
              </div>
            </th>

            {showExpanded && (
              <>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  رخصة عمل
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  جوازات
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  تأمين طبي
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  نقل
                </th>
                <th className="border-l border-slate-200 bg-blue-50/50 p-4 font-bold text-blue-600 dark:border-slate-700/50 dark:bg-blue-900/10 dark:text-blue-400">
                  أخرى
                </th>
              </>
            )}

            <th className="border-l border-slate-200 p-4 font-bold text-emerald-600 dark:border-slate-700/50 dark:text-emerald-400">
              الإجمالي
            </th>
            <th className="border-l border-slate-200 p-4 font-bold text-emerald-600 dark:border-slate-700/50 dark:text-emerald-400">
              المتفق عليه
            </th>
            <th className="border-l border-slate-200 p-4 font-bold text-emerald-600 dark:border-slate-700/50 dark:text-emerald-400">
              المستلم
            </th>
            <th className="border-l border-slate-200 p-4 font-bold text-red-600 dark:border-slate-700/50 dark:text-red-400">
              المتبقي
            </th>
            {showExpanded && (
              <>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  حالة الدفع
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  تاريخ استلام الدفعة
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم الشركة الموحد
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم المنشأه
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم التأمين
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  مذكرة
                </th>
              </>
            )}
            <th className="border-l border-slate-200 p-4 font-bold text-red-600 dark:border-slate-700/50 dark:text-red-400">
              اسم الوسيط
            </th>
            {showExpanded && (
              <>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم إقامة الوسيط
                </th>
                <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
                  رقم جوال الوسيط
                </th>
              </>
            )}
            <th className="border-l border-slate-200 p-4 font-bold dark:border-slate-700/50">
              ملاحظة
            </th>
            <th className="sticky left-0 z-10 bg-slate-50 p-4 text-center font-bold shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:bg-slate-800">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {data.map((item) => (
            <TransactionRow
              key={item.id}
              item={item}
              showExpanded={showExpanded}
              onDeleteRequest={onDeleteRequest}
              onEditRequest={onEditRequest}
              onAddPaymentRequest={onAddPaymentRequest}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={(e) => onToggleSelect(item.id, e)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
