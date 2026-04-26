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

// // تعريف نوع البيانات بناءً على مدخلاتك
// export type CompanyRecord = {
//   id: number
//   unifiedId: string
//   establishmentId: string
//   gosiId: string
//   owners: string
//   entityType: string
//   newsPublication: number
//   govFees: number
//   crFees: number
//   qiwa: number
//   muqeem: number
//   exemption: string
//   totalCost: number
//   transfersCount: number
//   visasCount: number
// }

// export const columns: ColumnDef<CompanyRecord>[] = [
//   { accessorKey: "id", header: "رقم" },
//   { accessorKey: "unifiedId", header: "الرقم الموحد" },
//   { accessorKey: "establishmentId", header: "رقم المنشأة" },
//   { accessorKey: "gosiId", header: "رقم التأمينات" },
//   { accessorKey: "owners", header: "ملاك الشركة" },
//   { accessorKey: "entityType", header: "نوع الكيان" },
//   {
//     accessorKey: "totalCost",
//     header: "إجمالي التكاليف",
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("totalCost"))
//       return (
//         <div className="font-bold text-primary">
//           {amount.toLocaleString()} ر.س
//         </div>
//       )
//     },
//   },
//   { accessorKey: "transfersCount", header: "عدد التنازل" },
//   { accessorKey: "visasCount", header: "عدد التأشيرات" },
//   // {
//   //   id: "actions",
//   //   cell: ({ row }) => {
//   //     return (
//   //       <DropdownMenu>
//   //         <DropdownMenuTrigger asChild>
//   //           <Button variant="ghost" className="h-8 w-8 p-0">
//   //             <MoreHorizontal className="h-4 w-4" />
//   //           </Button>
//   //         </DropdownMenuTrigger>
//   //         <DropdownMenuContent align="end">
//   //           <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
//   //           <DropdownMenuItem
//   //             onClick={() =>
//   //               navigator.clipboard.writeText(row.original.unifiedId)
//   //             }
//   //           >
//   //             نسخ الرقم الموحد
//   //           </DropdownMenuItem>
//   //           <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
//   //           <DropdownMenuItem className="text-destructive">
//   //             حذف
//   //           </DropdownMenuItem>
//   //         </DropdownMenuContent>
//   //       </DropdownMenu>
//   //     )
//   //   },
//   // },
// ]
