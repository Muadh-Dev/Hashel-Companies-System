"use client"

import ConectCompanyRow from "./ConectCompanyRow"
import { Companys } from "@/hooks/useConectCompanies"

export default function TransactionTableCompanies({
  data,
  onDeleteRequest,
}: {
  data: Companys[]
  onDeleteRequest: (item: Companys) => void
}) {
  return (
    <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/50 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
      <table className="w-full border-collapse text-right whitespace-nowrap transition-all duration-300">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <th className="border-l border-slate-200 p-4 text-center font-bold dark:border-slate-700/50">
              الشركة الأولى (الأساسية)
            </th>
            <th className="border-l border-slate-200 p-4 text-center font-bold dark:border-slate-700/50">
              الشركة الثانية (المرتبطة)
            </th>
            {/* رأس عمود الإجراءات */}
            <th className="w-20 border-l border-slate-200 p-4 text-center font-bold dark:border-slate-700/50">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <ConectCompanyRow
              key={item.id}
              item={item}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
