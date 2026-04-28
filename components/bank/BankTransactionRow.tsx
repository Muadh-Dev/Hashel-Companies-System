"use client"
import { BankTransaction } from "@/hooks/useBankBalance"
import { Trash2 } from "lucide-react"

export default function BankTransactionRow({
  item,
  onDeleteRequest,
}: {
  item: BankTransaction
  onDeleteRequest: (item: BankTransaction) => void
}) {
  return (
    <tr className="group text-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <td className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
        {item.operation_date}
      </td>
      <td className="border-l border-slate-100 p-4 text-center font-bold dark:border-slate-800">
        {item.operation}
      </td>
      <td className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
        {item.description}
      </td>
      <td className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
        {item.debit?.toLocaleString()}
      </td>
      <td className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
        {item.credit?.toLocaleString()}
      </td>
      <td className="p-4 text-center">
        <button
          onClick={() => onDeleteRequest(item)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  )
}
