// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { CustomCombobox } from "@/components/combobox"
// import { Briefcase, Building2, CreditCard, Plus, Pencil } from "lucide-react"
// import { BiMoney } from "react-icons/bi"
// import { cn } from "@/lib/utils"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"

// // تعريف نوع بيانات المعاملة (يمكن تصديره للاستخدام الخارجي)
// export interface TransactionData {
//   residentName: string
//   iqamaNumber: string
//   nationality: string
//   profession: string
//   expiryDate: string
//   company: string
//   serviceType: string
//   workPermit: number
//   passports: number
//   medicalInsurance: number
//   otherFees: number
//   agreedAmount: number
//   receivedAmount: number
//   payState: string
// }

// // القيم الافتراضية للإضافة الجديدة
// const defaultData: TransactionData = {
//   residentName: "",
//   iqamaNumber: "",
//   nationality: "",
//   profession: "",
//   expiryDate: "",
//   company: "",
//   serviceType: "",
//   workPermit: 0,
//   passports: 0,
//   medicalInsurance: 0,
//   otherFees: 0,
//   agreedAmount: 0,
//   receivedAmount: 0,
//   payState: "",
// }

// interface AddTransactionDialogProps {
//   open?: boolean
//   onOpenChange?: (open: boolean) => void
//   initialData?: Partial<TransactionData>
//   onSave?: (data: TransactionData) => void
//   trigger?: React.ReactNode
// }

// export default function AddTransactionDialog({
//   open: controlledOpen,
//   onOpenChange: controlledOnOpenChange,
//   initialData,
//   onSave,
//   trigger,
// }: AddTransactionDialogProps) {
//   const [internalOpen, setInternalOpen] = useState(false)
//   const open = controlledOpen !== undefined ? controlledOpen : internalOpen
//   const onOpenChange = controlledOnOpenChange || setInternalOpen

//   const [data, setData] = useState<TransactionData>(defaultData)

//   useEffect(() => {
//     if (initialData && Object.keys(initialData).length > 0) {
//       setData((prev) => ({ ...prev, ...initialData }))
//     } else {
//       setData(defaultData)
//     }
//   }, [initialData])

//   const handleInputChange = (
//     field: keyof TransactionData,
//     value: string | number
//   ) => {
//     setData((prev) => ({ ...prev, [field]: value }))
//   }

//   const totalFees =
//     data.workPermit + data.passports + data.medicalInsurance + data.otherFees
//   const netProfit = data.agreedAmount - totalFees
//   const remainingAmount = data.agreedAmount - data.receivedAmount

//   const handleSave = () => {
//     onSave?.(data)
//     onOpenChange(false)
//     if (!controlledOpen) setData(defaultData)
//   }

//   const isEditMode = !!initialData && Object.keys(initialData).length > 0

//   // زر سطح المكتب العادي
//   const DesktopTrigger = (
//     <Button
//       className="hidden items-center gap-2 px-5 shadow-sm md:flex"
//       onClick={() => onOpenChange(true)}
//     >
//       <Plus className="h-4 w-4" />
//       <span>إضافة معاملة</span>
//     </Button>
//   )

//   // زر هاتف عائم - يظهر فقط في وضع الهاتف وعندما يكون الحوار مغلقاً
//   const FloatingTrigger = !open && (
//     <Button
//       size="icon"
//       className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-primary shadow-2xl shadow-primary/40 transition-transform hover:scale-105 active:scale-95 md:hidden"
//       onClick={() => onOpenChange(true)}
//     >
//       <Plus className="h-6 w-6 text-white" />
//     </Button>
//   )

//   // إذا كان المستخدم قد مرر trigger مخصص نستخدمه، وإلا نستخدم الأزرار الافتراضية
//   const defaultTrigger = (
//     <>
//       {DesktopTrigger}
//       {FloatingTrigger}
//     </>
//   )

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogTrigger asChild>
//         {trigger ? trigger : defaultTrigger}
//       </DialogTrigger>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
//         <DialogHeader>
//           <DialogTitle className="text-right">
//             {isEditMode ? "تعديل معاملة" : "إضافة معاملة"}
//           </DialogTitle>
//           <DialogDescription className="text-right">
//             {isEditMode
//               ? "قم بتعديل بيانات المقيم والخدمة."
//               : "قم بإدخال بيانات المقيم والخدمة لإضافتها."}
//           </DialogDescription>
//         </DialogHeader>

//         <Card className="border-border/50 shadow-sm">
//           <CardContent className="space-y-8 p-6">
//             {/* بيانات المقيم */}
//             <section className="space-y-4">
//               <SubHeader title="بيانات المقيم" icon={Building2} />
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="resident-name">اسم المقيم</Label>
//                   <Input
//                     id="resident-name"
//                     value={data.residentName}
//                     onChange={(e) =>
//                       handleInputChange("residentName", e.target.value)
//                     }
//                     placeholder="أدخل اسم المقيم"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="iqama-number">رقم الإقامة</Label>
//                   <Input
//                     id="iqama-number"
//                     value={data.iqamaNumber}
//                     onChange={(e) =>
//                       handleInputChange("iqamaNumber", e.target.value)
//                     }
//                     dir="rtl"
//                     maxLength={10}
//                     placeholder="مثال: 1234567891"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="nationality">الجنسية</Label>
//                   <Input
//                     id="nationality"
//                     value={data.nationality}
//                     onChange={(e) =>
//                       handleInputChange("nationality", e.target.value)
//                     }
//                     placeholder="الجنسية"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="profession">المهنة</Label>
//                   <Input
//                     id="profession"
//                     value={data.profession}
//                     onChange={(e) =>
//                       handleInputChange("profession", e.target.value)
//                     }
//                     placeholder="مهنة المقيم"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="expiry-date">تاريخ انتهاء الإقامة</Label>
//                   <Input
//                     id="expiry-date"
//                     type="date"
//                     value={data.expiryDate}
//                     onChange={(e) =>
//                       handleInputChange("expiryDate", e.target.value)
//                     }
//                   />
//                 </div>
//               </div>
//             </section>

//             <Separator className="bg-border/50" />

//             {/* بيانات الخدمة */}
//             <section className="space-y-4">
//               <SubHeader title="بيانات الخدمة" icon={Briefcase} />
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//                 <div className="space-y-2">
//                   <Label>الشركة</Label>
//                   <CustomCombobox
//                     placeholder="اختر الشركة..."
//                     options={["هاشل اليامي", "معاذ الجعيدي", "شركة الراجحي"]}
//                     value={data.company}
//                     onChange={(val) => handleInputChange("company", val)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>نوع الخدمة</Label>
//                   <CustomCombobox
//                     placeholder="اختر نوع الخدمة..."
//                     options={[
//                       "تنازل",
//                       "إصدار تأشيرة",
//                       "تجديد إقامة",
//                       "نقل كفالة",
//                     ]}
//                     value={data.serviceType}
//                     onChange={(val) => handleInputChange("serviceType", val)}
//                   />
//                 </div>
//               </div>
//             </section>

//             <Separator className="bg-border/50" />

//             {/* الرسوم الحكومية + ملخص الحسابات */}
//             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
//               <section className="flex flex-col space-y-4">
//                 <SubHeader title="الرسوم الحكومية" icon={BiMoney} />
//                 <div className="grid flex-1 grid-cols-1 gap-4 rounded-2xl border border-border/50 p-6 md:grid-cols-2">
//                   <div className="space-y-2">
//                     <Label htmlFor="work-permit">كرت العمل (ريال)</Label>
//                     <Input
//                       id="work-permit"
//                       type="number"
//                       value={data.workPermit}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "workPermit",
//                           parseFloat(e.target.value) || 0
//                         )
//                       }
//                       placeholder="0.00"
//                       className="h-11"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="passports">الجوازات (ريال)</Label>
//                     <Input
//                       id="passports"
//                       type="number"
//                       value={data.passports}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "passports",
//                           parseFloat(e.target.value) || 0
//                         )
//                       }
//                       placeholder="0.00"
//                       className="h-11"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="medical-insurance">
//                       التأمين الطبي (ريال)
//                     </Label>
//                     <Input
//                       id="medical-insurance"
//                       type="number"
//                       value={data.medicalInsurance}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "medicalInsurance",
//                           parseFloat(e.target.value) || 0
//                         )
//                       }
//                       placeholder="0.00"
//                       className="h-11"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="other-fees">رسوم أخرى (ريال)</Label>
//                     <Input
//                       id="other-fees"
//                       type="number"
//                       value={data.otherFees}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "otherFees",
//                           parseFloat(e.target.value) || 0
//                         )
//                       }
//                       placeholder="0.00"
//                       className="h-11"
//                     />
//                   </div>
//                 </div>
//               </section>

//               <section className="flex flex-col space-y-4">
//                 <SubHeader title="ملخص الحسابات" icon={Briefcase} />
//                 <div className="flex flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-blue-200/60 bg-linear-to-br from-blue-50/50 to-white shadow-sm dark:border-blue-800/40 dark:from-blue-950/20 dark:to-slate-950/40">
//                   <div className="space-y-5 p-6">
//                     <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-blue-900/30">
//                       <span className="text-sm font-medium text-muted-foreground">
//                         إجمالي الرسوم
//                       </span>
//                       <span className="text-xl font-bold text-foreground">
//                         {totalFees.toLocaleString()}{" "}
//                         <small className="text-xs font-normal opacity-70">
//                           ر.س
//                         </small>
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-muted-foreground">
//                         قيمة المعاملة
//                       </span>
//                       <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
//                         {data.agreedAmount.toLocaleString()}{" "}
//                         <small className="text-xs font-normal opacity-70">
//                           ر.س
//                         </small>
//                       </span>
//                     </div>
//                     <div
//                       className={cn(
//                         "flex items-center justify-between rounded-xl border p-4 transition-all",
//                         netProfit >= 0
//                           ? "border-green-200/50 bg-green-100/40 dark:bg-green-900/20"
//                           : "border-red-200/50 bg-red-100/40 dark:bg-red-900/20"
//                       )}
//                     >
//                       <div className="flex flex-col">
//                         <span
//                           className={cn(
//                             "text-sm font-bold",
//                             netProfit >= 0
//                               ? "text-green-800 dark:text-green-400"
//                               : "text-red-800 dark:text-red-400"
//                           )}
//                         >
//                           صافي الربح
//                         </span>
//                       </div>
//                       <span
//                         className={cn(
//                           "text-2xl font-black",
//                           netProfit >= 0
//                             ? "text-green-700 dark:text-green-400"
//                             : "text-red-700 dark:text-red-400"
//                         )}
//                       >
//                         {netProfit.toLocaleString()}{" "}
//                         <small className="text-sm font-bold">ر.س</small>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </section>
//             </div>

//             <Separator className="bg-border/50" />

//             {/* التحصيل والدفع */}
//             <section className="space-y-4">
//               <SubHeader title="التحصيل والدفع" icon={CreditCard} />
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="agreed-amount">المبلغ المتفق عليه</Label>
//                   <Input
//                     id="agreed-amount"
//                     type="number"
//                     value={data.agreedAmount}
//                     onChange={(e) =>
//                       handleInputChange(
//                         "agreedAmount",
//                         parseFloat(e.target.value) || 0
//                       )
//                     }
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="received-amount">المبلغ المستلم</Label>
//                   <Input
//                     id="received-amount"
//                     type="number"
//                     value={data.receivedAmount}
//                     onChange={(e) =>
//                       handleInputChange(
//                         "receivedAmount",
//                         parseFloat(e.target.value) || 0
//                       )
//                     }
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="remaining-amount">المتبقي</Label>
//                   <Input
//                     id="remaining-amount"
//                     value={remainingAmount.toFixed(2)}
//                     disabled
//                     className="font-bold text-red-700 dark:text-amber-200"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>حالة الدفع</Label>
//                   <CustomCombobox
//                     placeholder="حدد الحالة..."
//                     options={["خالص", "دفع جزئي", "لم يدفع"]}
//                     value={data.payState}
//                     onChange={(val) => handleInputChange("payState", val)}
//                   />
//                 </div>
//               </div>
//             </section>

//             <div className="flex justify-end pt-4">
//               <Button
//                 onClick={handleSave}
//                 size="lg"
//                 className="w-full min-w-36 font-bold md:w-auto"
//               >
//                 {isEditMode ? "تحديث" : "حفظ وإدخال"}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </DialogContent>
//     </Dialog>
//   )
// }

// // مكون العنوان الفرعي
// interface SubHeaderProps {
//   title: string
//   icon: React.ElementType
// }

// function SubHeader({ title, icon: Icon }: SubHeaderProps) {
//   return (
//     <div className="mb-5 flex items-center gap-2">
//       <div className="rounded-lg bg-primary/10 p-2">
//         <Icon className="h-5 w-5 text-primary" />
//       </div>
//       <h2 className="text-xl font-semibold tracking-tight text-foreground">
//         {title}
//       </h2>
//     </div>
//   )
// }
