"use client"
import { Companys } from "@/hooks/useConectCompanies"
import { Trash2 } from "lucide-react"

export default function ConectCompanyRow({
  item,
  onDeleteRequest,
}: {
  item: Companys
  onDeleteRequest: (item: Companys) => void
}) {
  return (
    <tr className="group text-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <td className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
        {item.com1}
      </td>
      <td className="border-l border-slate-100 p-4 text-center font-bold dark:border-slate-800">
        {item.com2}
      </td>
      <td className="p-4 text-center">
        <button
          onClick={() => onDeleteRequest(item)} // نرسل العنصر كاملاً للصفحة الرئيسية
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  )
}
