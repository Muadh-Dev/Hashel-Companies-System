// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Card } from "@/components/ui/card"
// import { cn } from "@/lib/utils"

// // 1. تعريف شكل البيانات القادمة من قاعدة البيانات
// export interface ResidentData {
//   name: string
//   companies: string
//   money: string | number
//   dateEnd: number | string
//   phone: string
// }

// // 2. تعريف الـ Props للمكون
// interface ResidentTableProps {
//   data: ResidentData[]
//   className?: string
// }

// export function ResidentTable({ data, className }: ResidentTableProps) {
//   // فرز البيانات تلقائياً من الأقل أياماً إلى الأكثر أياماً
//   const sortedData = [...data].sort(
//     (a, b) => Number(a.dateEnd) - Number(b.dateEnd)
//   )

//   // دالة مساعدة لتحديد لون الشارة بناءً على الأيام المتبقية (مع دعم الوضع الليلي)
//   const getBadgeColor = (days: number) => {
//     if (days < 15) {
//       return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500"
//     }
//     if (days < 30) {
//       return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500"
//     }
//     return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500"
//   }

//   return (
//     <div className="overflow-x-auto">
//       <Table dir="rtl" className="w-full whitespace-nowrap">
//         <TableHeader className="bg-muted/50">
//           <TableRow>
//             <TableHead className="text-right font-bold">الاسم</TableHead>
//             <TableHead className="text-right font-bold">الشركة</TableHead>
//             <TableHead className="text-right font-bold">
//               المبلغ المتبقي
//             </TableHead>
//             <TableHead className="text-center font-bold">رقم الهاتف</TableHead>
//             <TableHead className="text-center font-bold">
//               الأيام المتبقية
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {sortedData.length > 0 ? (
//             sortedData.map((item, index) => {
//               const daysLeft = Number(item.dateEnd)

//               return (
//                 <TableRow
//                   key={index}
//                   className="transition-colors hover:bg-muted/30"
//                 >
//                   <TableCell className="font-medium">{item.name}</TableCell>
//                   <TableCell>{item.companies}</TableCell>
//                   <TableCell className="font-semibold text-primary">
//                     {typeof item.money === "number"
//                       ? item.money.toLocaleString()
//                       : item.money}{" "}
//                     ر.س
//                   </TableCell>
//                   {/* استخدام dir="ltr" لضمان ظهور رقم الهاتف بشكل صحيح */}
//                   <TableCell className="text-center tabular-nums" dir="ltr">
//                     {item.phone}
//                   </TableCell>
//                   <TableCell className="text-center">
//                     <span
//                       className={cn(
//                         "rounded-full px-3 py-1 text-xs font-bold transition-colors",
//                         getBadgeColor(daysLeft)
//                       )}
//                     >
//                       {daysLeft} يوم
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               )
//             })
//           ) : (
//             <TableRow>
//               <TableCell
//                 colSpan={5}
//                 className="h-24 text-center text-muted-foreground"
//               >
//                 لا توجد بيانات متاحة حالياً.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }
