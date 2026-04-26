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

// // تعريف نوع البيانات المحدث
// export type CompanyRecord = {
//   id: number
//   operationDate: string
//   establishmentId: string
//   gosiId: string
//   unifiedId: string
//   residentName: string
//   borderNumber?: string
//   visaNumber?: string
//   residencyNumber: string
//   nationality: string
//   profession: string
//   residencyExpiryDate: string
//   daysRemaining: number
//   serviceType: string
//   mobileNumber: string
//   receiptNote: string
//   collectionTime: string
//   fees: {
//     workPermit: number
//     jawazat: number
//     medicalInsurance: number
//     transferFee: number
//     visaIssuance: number
//     residencyFee: number
//     otherFees: number
//     newsPublication: number
//     crFees: number
//     qiwa: number
//     muqeem: number
//   }
//   totalFees: number
//   amountReceived: number
//   remainingAmount: number
//   netToDate: number
//   notes: string
//   notes2?: string
//   internalNote?: string
// }

// // تعريف أعمدة الجدول
// export const columnsOperations: ColumnDef<CompanyRecord>[] = [
//   { accessorKey: "id", header: "رقم" },
//   { accessorKey: "operationDate", header: "تاريخ العملية" },
//   { accessorKey: "establishmentId", header: "رقم المنشأة" },
//   { accessorKey: "residentName", header: "اسم المقيم" },
//   { accessorKey: "residencyNumber", header: "رقم الإقامة" },
//   { accessorKey: "serviceType", header: "نوع الخدمة" },
//   {
//     accessorKey: "daysRemaining",
//     header: "الأيام المتبقية",
//     cell: ({ row }) => {
//       const days = parseInt(row.getValue("daysRemaining"))
//       // تلوين الأيام بالأحمر إذا انتهت الإقامة، وبالأخضر إذا كانت سارية
//       return (
//         <div
//           className={`font-semibold ${days <= 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
//         >
//           {days} يوم
//         </div>
//       )
//     },
//   },
//   {
//     accessorKey: "totalFees",
//     header: "إجمالي الرسوم",
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("totalFees"))
//       return (
//         <div className="font-bold text-primary">
//           {amount.toLocaleString()} ر.س
//         </div>
//       )
//     },
//   },
//   {
//     accessorKey: "remainingAmount",
//     header: "المتبقي",
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("remainingAmount"))
//       // إبراز المبلغ المتبقي باللون الأحمر إذا كان هناك مديونية
//       return (
//         <div
//           className={`font-bold ${amount > 0 ? "text-destructive" : "text-muted-foreground"}`}
//         >
//           {amount.toLocaleString()} ر.س
//         </div>
//       )
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const record = row.original

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">فتح القائمة</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>إجراءات</DropdownMenuLabel>

//             <DropdownMenuItem
//               onClick={() =>
//                 navigator.clipboard.writeText(record.residencyNumber)
//               }
//             >
//               نسخ رقم الإقامة
//             </DropdownMenuItem>

//             <DropdownMenuItem
//               onClick={() =>
//                 navigator.clipboard.writeText(record.establishmentId)
//               }
//             >
//               نسخ رقم المنشأة
//             </DropdownMenuItem>

//             {/* في حال أردت تمرير البيانات لصفحة تفاصيل كاملة تعرض الكائنات المتداخلة (fees) */}
//             <DropdownMenuItem>عرض التفاصيل الكاملة والرسوم</DropdownMenuItem>

//             <DropdownMenuItem className="focus:text-destructive-foreground text-destructive focus:bg-destructive">
//               حذف السجل
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       )
//     },
//   },
// ]
