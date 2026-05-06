"use client"

import {
  Banknote,
  BanknoteArrowUp,
  Check,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
} from "lucide-react"
import { Transaction } from "@/hooks/useTransactions"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu"
import { toast } from "sonner"
import { CheckboxCell } from "../CheckboxCell"

type Props = {
  item: Transaction & {
    operationDate: string
    daysRemaining: number
    remainingAmount: number
  }
  showExpanded: boolean

  onDeleteRequest: (item: Transaction) => void
  onEditRequest: (item: Transaction) => void
  onAddPaymentRequest: (item: Transaction) => void
  isSelected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
}

export default function TransactionRow({
  item,
  showExpanded,
  onDeleteRequest,
  onEditRequest,
  onAddPaymentRequest,
  isSelected,
  onToggleSelect,
}: Props) {
  return (
    <tr className="text-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <td className="cursor-pointer" onClick={onToggleSelect}>
        <CheckboxCell isSelected={isSelected} onToggle={onToggleSelect} />
      </td>
      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        {item.operationDate}
      </td>
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.resident_name}
      </td>

      {showExpanded && (
        <>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.iqama_number}
          </td>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.hodod_number}
          </td>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.tashira_number}
          </td>
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            {item.nationality}
          </td>
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            {item.profession}
          </td>
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            {item.phone_num}
          </td>
        </>
      )}

      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {item.service_type}
        </span>
      </td>
      <td className="border-l border-slate-100 p-4 font-medium dark:border-slate-800">
        {item.expiry_date
          ? new Date(item.expiry_date).toLocaleDateString("ar-SA")
          : "-"}
      </td>
      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        <span
          className={`font-bold ${
            item.daysRemaining <= 15
              ? "animate-pulse text-red-500"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {item.daysRemaining}
        </span>
      </td>

      {showExpanded && (
        <>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {item.work_permit}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {item.passports}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {item.medical_insurance}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {item.transport_fees}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {item.other_fees}
          </td>
        </>
      )}

      <td className="border-l border-slate-100 p-4 font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
        {Number(
          item.work_permit +
            item.passports +
            item.medical_insurance +
            item.other_fees +
            item.transport_fees
        ).toLocaleString()}
      </td>
      <td className="border-l border-slate-100 p-4 font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
        {Number(item.agreed_amount || 0).toLocaleString()}
      </td>
      <td className="border-l border-slate-100 p-4 font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
        {Number(item.received_amount || 0).toLocaleString()}
      </td>
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        <span
          className={
            item.remainingAmount > 0 ? "text-red-500" : "text-slate-500"
          }
        >
          {item.remainingAmount.toLocaleString()}
        </span>
      </td>
      {showExpanded && (
        <>
          {/* عرض pay_state كنص مع تنسيق لوني */}
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.agreed_amount <= item.received_amount
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {item.received_amount >= item.agreed_amount
                ? "خالص"
                : item.received_amount === 0
                  ? "لم يدفع"
                  : "دفع جزئي"}
            </span>
          </td>

          <td className="border-l border-slate-100 p-4 font-medium dark:border-slate-800">
            {item.payment_date
              ? new Date(item.payment_date).toLocaleDateString("ar-SA")
              : "-"}
          </td>

          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.unified_number_of_company}
          </td>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.companies?.establishment_number}
          </td>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.companies?.social_insurance_number}
          </td>
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            {item.memo_number || "-"}
          </td>
        </>
      )}

      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.Wresident_name}
      </td>
      {showExpanded && (
        <>
          <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
            {item.Wiqama_number}
          </td>
          <td className="border-l border-slate-100 p-4 dark:border-slate-800">
            {item.Wphone_num}
          </td>
        </>
      )}

      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        {item.note || "لاتوجد ملاحظة"}
      </td>

      <td className="sticky left-0 z-10 border-r border-slate-100 bg-white p-4 text-center shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <DropdownMenu dir="rtl">
          {/* نستخدم asChild لتجنب تداخل أزرار داخل بعضها البعض */}
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-2 text-slate-400 transition-colors outline-none hover:bg-slate-200 dark:hover:bg-slate-700">
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">فتح القائمة</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onAddPaymentRequest?.(item)}
            >
              <BanknoteArrowUp className="mr-2 h-4 w-4" /> إضافة مبلغ مالي
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEditRequest?.(item)}
            >
              <Edit className="mr-2 h-4 w-4" /> تعديل
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => onDeleteRequest(item)}
            >
              <Trash className="mr-2 h-4 w-4" /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
