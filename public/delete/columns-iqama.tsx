// "use client"

// import { ColumnDef } from "@tanstack/react-table"
// import { MoreHorizontal } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { cn } from "@/lib/utils"

// export type CompanyRecord = {
//   name: string
//   companies: string
//   money: string | number
//   dateEnd: number | string
//   phone: string
// }

// const getBadgeColor = (days: number) => {
//   if (days < 15)
//     return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500"
//   if (days < 30)
//     return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500"
//   return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500"
// }

// export const columnsIqama: ColumnDef<CompanyRecord>[] = [
//   {
//     id: "index", // 1. عمود التسلسل الرقمي (1, 2, 3...)
//     header: "رقم",
//     cell: ({ row }) => (
//       <div className="pr-1.5 font-medium">{row.index + 1}</div>
//     ),
//   },
//   {
//     accessorKey: "name",
//     header: "الاسم",
//   },
//   {
//     accessorKey: "companies",
//     header: "الشركة",
//   },
//   {
//     accessorKey: "money",
//     header: "المبلغ المتبقي",
//     cell: ({ row }) => {
//       // 2. حل مشكلة المبلغ المتبقي عبر تحويل القيمة لرقم أولاً
//       const amount = row.getValue("money") as string | number
//       const numericAmount = Number(amount)

//       return (
//         <span className="font-semibold text-primary dark:text-chart-1">
//           {!isNaN(numericAmount) ? numericAmount.toLocaleString() : amount} ر.س
//         </span>
//       )
//     },
//   },
//   {
//     accessorKey: "phone",
//     header: "رقم الهاتف",
//     cell: ({ row }) => (
//       <div dir="rtl" className="tabular-nums">
//         {row.getValue("phone")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "dateEnd",
//     header: "الأيام المتبقية",
//     // 3. ضمان أن الجدول يفهم أن هذا العمود عبارة عن أرقام ليقوم بفرزها بشكل صحيح
//     sortingFn: (rowA, rowB, columnId) => {
//       const a = Number(rowA.getValue(columnId))
//       const b = Number(rowB.getValue(columnId))
//       return a - b
//     },
//     cell: ({ row }) => {
//       const days = Number(row.getValue("dateEnd"))
//       return (
//         <div>
//           <span
//             className={cn(
//               "rounded-full px-3 py-1 text-xs font-bold transition-colors",
//               getBadgeColor(days)
//             )}
//           >
//             {days} يوم
//           </span>
//         </div>
//       )
//     },
//   },
// ]
