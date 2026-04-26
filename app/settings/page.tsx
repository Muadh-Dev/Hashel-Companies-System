"use client"
import { useState } from "react"
import {
  User,
  Users,
  Database,
  FileSpreadsheet,
  Download,
  UserPlus,
} from "lucide-react"
import { Dialog } from "@/components/Dialog"
import {
  Input,
  Label,
  SearchableSelect,
  SubHeader,
} from "@/components/ui-helpers"
import ExportToExcel from "@/components/o/ExportToExcel"
import ExportCompaniesToExcel from "@/components/c/ExportCompaniesConnectToExcel"
import { Excel } from "@/components/companies/Excel"
import { toast } from "sonner"

export default function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  const isFormInvalid = !name.trim() || !role

  const handleSave = () => {
    console.log("تم الحفظ:", { name, role })
    setIsModalOpen(false)
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
            <button
              // onClick={() => setIsModalOpen(true)}
              onClick={() =>
                toast.error("لا توجد لديك الصلاحيات لإضافة مستخدمين", {
                  position: "top-center",
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              إضافة مستخدم
            </button>
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
            <Excel />
          </div>
        </div>
      </div>

      {/* ---------------- نافذة الإضافة (Modal) ---------------- */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="إضافة مستخدم جديد"
        isSaveDisabled={isFormInvalid}
      >
        <div dir="rtl" className="space-y-6">
          <SubHeader title="البيانات الأساسية" icon={User} />

          <div className="space-y-4">
            <div>
              <Label text="اسم المستخدم" required />
              <Input
                value={name}
                onChange={setName}
                placeholder="أدخل الاسم رباعي..."
              />
            </div>

            <div>
              <Label text="الصلاحية" required />
              <SearchableSelect
                placeholder="اختر الصلاحية..."
                value={role}
                onChange={setRole}
                options={[
                  { id: "1", name: "مدير النظام" },
                  { id: "2", name: "مشرف" },
                ]}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
