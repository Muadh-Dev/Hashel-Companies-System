"use client"

import {
  BanknoteArrowUp,
  Edit,
  MoreHorizontal,
  Trash,
  Check,
} from "lucide-react"
import { Company } from "@/hooks/useCompanies"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type Props = {
  item: Company
  showExpanded: boolean
  onEditRequest: (item: Company) => void
  onDeleteRequest: (item: Company) => void
  // التحديد المتعدد
  isSelected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
}

export default function CompanyRow({
  item,
  showExpanded,
  onEditRequest,
  onDeleteRequest,
  isSelected,
  onToggleSelect,
}: Props) {
  return (
    <tr
      data-id={item.id}
      className={`text-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${
        isSelected ? "bg-blue-50/60 dark:bg-blue-900/20" : ""
      }`}
    >
      {/* خلية التحديد */}
      <td
        className="cursor-pointer border-l border-slate-100 p-4 select-none dark:border-slate-800"
        onClick={onToggleSelect}
      >
        <div className="flex items-center justify-center">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
              isSelected
                ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-500"
                : "border-slate-300 bg-white hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400"
            }`}
          >
            {isSelected && (
              <Check
                className="h-3 w-3 text-white transition-transform group-active:scale-75"
                strokeWidth={3}
              />
            )}
          </div>
        </div>
      </td>

      {/* الرقم الموحد */}
      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        {item.unified_number}
      </td>

      {/* رقم المنشأة */}
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.establishment_number}
      </td>

      {/* رقم التأمينات */}
      <td className="border-l border-slate-100 p-4 font-mono dark:border-slate-800">
        {item.social_insurance_number}
      </td>

      {/* ملاك الشركة */}
      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        {item.company_owner}
      </td>

      {/* نوع الكيان */}
      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {item.entity_type}
        </span>
      </td>

      <td className="border-l border-slate-100 p-4 dark:border-slate-800">
        {item.crNumber}
      </td>

      {/* الأعمدة المخفية افتراضياً */}
      {showExpanded && (
        <>
          <td className="border-l border-slate-100 p-4 font-medium dark:border-slate-800">
            {item.cr_expiry_date
              ? new Date(item.cr_expiry_date).toLocaleDateString("ar-SA")
              : "-"}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.newspaper_price || 0).toLocaleString()}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.government_fees || 0).toLocaleString()}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.commercial_register_fees || 0).toLocaleString()}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.qiwa || 0).toLocaleString()}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.muqeem || 0).toLocaleString()}
          </td>
          <td className="border-l border-slate-100 bg-blue-50/20 p-4 font-mono dark:border-slate-800 dark:bg-blue-900/5">
            {Number(item.exemption_amount || 0).toLocaleString()}
          </td>
        </>
      )}

      {/* إجمالي التكاليف */}
      <td className="border-l border-slate-100 p-4 font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
        {Number(
          item.newspaper_price +
            item.government_fees +
            item.commercial_register_fees +
            item.qiwa +
            item.muqeem +
            item.exemption_amount
        )}
      </td>

      {/* عدد نقل كفالة */}
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.transfers_count}
      </td>

      {/* عدد إصدار التأشيرات */}
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.visas_count}
      </td>

      {/* عدد العمال */}
      <td className="border-l border-slate-100 p-4 font-bold dark:border-slate-800">
        {item.employees_count}
      </td>

      {/* إجراءات */}
      <td className="sticky left-0 z-10 border-r border-slate-100 bg-white p-4 text-center shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <DropdownMenu dir="rtl">
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
              onClick={() => onEditRequest(item)}
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
