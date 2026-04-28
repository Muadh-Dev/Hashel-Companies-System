"use client"
import { useEffect, useState } from "react"
import {
  Users,
  Database,
  FileSpreadsheet,
  Download,
  UserPlus,
  Banknote,
  Settings2,
} from "lucide-react"
import ExportToExcel from "@/components/o/ExportToExcel"
import ExportCompaniesToExcel from "@/components/c/ExportCompaniesConnectToExcel"
import ExportCompaniesFullToExcel from "@/components/companies/ExportCompaniesFullToExcel"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { getPrice, setPrice } from "@/lib/defalutValues"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function MyPage() {
  const { user } = useAuth()

  // تعريف الحالات (States) للقيم الثلاث
  const [prices, setPrices] = useState({
    commercial_register_fees: 0,
    qiwa: 0,
    muqeem: 0,
  })

  // جلب القيم عند أول تحميل للمكون
  useEffect(() => {
    setPrices({
      commercial_register_fees: getPrice("commercial_register_fees"),
      qiwa: getPrice("qiwa"),
      muqeem: getPrice("muqeem"),
    })
  }, [])

  // دالة التعامل مع التغيير
  const handleChange = (key: keyof typeof prices, value: string) => {
    const numValue = Number(value)
    // 1. تحديث الحالة في الواجهة
    setPrices((prev) => ({ ...prev, [key]: numValue }))
    // 2. حفظ القيمة في localStorage باستخدام الكود الخاص بك
    setPrice(key, numValue)
  }

  return (
    // إضافة dir="rtl" لدعم الاتجاه العربي بشكل كامل
    <div dir="rtl" className="space-y-6 p-6 font-sans md:p-10">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight">
          إعدادات النظام
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          إدارة الصلاحيات وتصدير البيانات الخاصة بالنظام.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ---------------- بطاقة إدارة المستخدمين ---------------- */}
        <div className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center">
          {/* تأثير الدائرة في الخلفية */}
          <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                إدارة المستخدمين
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                إضافة مستخدمين جدد وتحديد صلاحياتهم
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <a
              href="/users"
              onClick={(e) => {
                // إذا لم يكن المستخدم مديراً
                if (!user?.is_admin) {
                  e.preventDefault() // منع الرابط من الانتقال لصفحة /users
                  toast.warning("لا توجد لديك صلاحية للدخول!", {
                    position: "top-center",
                  })
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              إدارة المستخدمين
            </a>
          </div>
        </div>

        {/* ---------------- بطاقة تصدير جدول المعاملات ---------------- */}
        <div className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-blue-500/30 hover:shadow-md sm:flex-row sm:items-center">
          <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
              <Database className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                جدول المعاملات
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                تصدير كافة المعاملات إلى ملف Excel
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-end">
            <ExportToExcel />
          </div>
        </div>

        {/* ---------------- بطاقة تصدير الشركات المرتبطة ---------------- */}
        <div className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-orange-500/30 hover:shadow-md sm:flex-row sm:items-center">
          <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-orange-500/5 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                الشركات المرتبطة
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                استخراج بيانات الشركات المرتبطة
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-end">
            <ExportCompaniesToExcel />
          </div>
        </div>

        {/* ---------------- بطاقة تصدير ملف الشركات ---------------- */}
        <div className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-500/30 hover:shadow-md sm:flex-row sm:items-center">
          <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-emerald-500/5 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
              <Download className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">ملف الشركات</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                تحميل السجل الكامل للشركات
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-end">
            <ExportCompaniesFullToExcel />
          </div>
        </div>
      </div>

      {/* ---------------- بطاقة تصديرالرصيد البنكي ---------------- */}
      <div className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-emerald-500/30 hover:shadow-md sm:flex-row sm:items-center">
        <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-emerald-500/5 transition-transform duration-500 group-hover:scale-150" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
            <Banknote className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">الرصيد البنكي</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              تحميل السجل الكامل للرصيد البنكي
            </p>
          </div>
        </div>
        <div className="relative z-10 flex justify-end">
          <ExportCompaniesFullToExcel />
        </div>
      </div>
      {/* ---------------- بطاقة تعديل الأسعار المحدثة ---------------- */}
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-blue-500/30 hover:shadow-md">
        {/* الزخرفة الخلفية لتناسب النمط العام */}
        <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-150" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                إعدادات الرسوم والأسعار
              </h2>
              <p className="text-sm text-muted-foreground">
                تعديل القيم الافتراضية المحفوظة محلياً
              </p>
            </div>
          </div>

          {/* الحقول بتنسيق Grid مرن */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cr_fees" className="text-sm font-semibold">
                رسوم السجل التجاري
              </Label>
              <div className="relative">
                <span className="absolute top-2.5 right-3 font-mono text-xs text-muted-foreground">
                  ريال
                </span>
                <Input
                  id="cr_fees"
                  type="number"
                  value={prices.commercial_register_fees}
                  onChange={(e) =>
                    handleChange("commercial_register_fees", e.target.value)
                  }
                  className="pr-12 pl-3 text-left font-mono focus-visible:ring-blue-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qiwa" className="text-sm font-semibold">
                رسوم منصة قوى
              </Label>
              <div className="relative">
                <span className="absolute top-2.5 right-3 font-mono text-xs text-muted-foreground">
                  ريال
                </span>
                <Input
                  id="qiwa"
                  type="number"
                  value={prices.qiwa}
                  onChange={(e) => handleChange("qiwa", e.target.value)}
                  className="pr-12 pl-3 text-left font-mono focus-visible:ring-blue-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="muqeem" className="text-sm font-semibold">
                رسوم منصة مقيم
              </Label>
              <div className="relative">
                <span className="absolute top-2.5 right-3 font-mono text-xs text-muted-foreground">
                  ريال
                </span>
                <Input
                  id="muqeem"
                  type="number"
                  value={prices.muqeem}
                  onChange={(e) => handleChange("muqeem", e.target.value)}
                  className="pr-12 pl-3 text-left font-mono focus-visible:ring-blue-500"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
