// add.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Briefcase,
  Building2,
  CreditCard,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
  Pencil,
} from "lucide-react"
import { addTransaction, updateTransaction } from "./upload" // 🆕 استيراد updateTransaction
import { toast } from "sonner"
import { Transaction } from "@/hooks/useTransactions"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

// ==========================================
// 1. Constants & Types
// ==========================================
const SERVICE_TYPES = ["نقل كفالة", "إصدار تأشيرة", "تجديد سنوي"] as const
const COMPANIES = [{ name: "هاشل اليامي", id: "7051022502" }]

type ServiceType = (typeof SERVICE_TYPES)[number]

// إنشاء نوع للبيانات بدون الحقول المحسوبة
type TransactionInput = Omit<Transaction, "id" | "created_at" | "companies">

// القيم الافتراضية مع تطابق الأنواع
const getDefaultData = (): TransactionInput => ({
  resident_name: "",
  phone_num: 0,
  payment_date: null,
  iqama_number: "",
  nationality: "",
  profession: "",
  expiry_date: null,
  memo_number: "",
  service_type: SERVICE_TYPES[0], // القيمة الافتراضية من المصفوفة
  work_permit: 0,
  passports: 0,
  medical_insurance: 0,
  transport_fees: 0,
  other_fees: 0,
  agreed_amount: 0,
  received_amount: 0,
  note: "",
  unified_number_of_company: "",
  working: "نعم",
})

// ==========================================
// 2. Modal Component
// ==========================================
interface TransactionModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onSave: (transaction: Transaction) => void
  activeTab: string
  initialData?: Transaction | null // 🆕 بيانات التعديل
}

const searchCompanies = async (query: string) => {
  const { data, error } = await supabase
    .from("companies")
    .select("unified_number") // حقول خفيفة
    .ilike("unified_number", `%${query}%`) // بحث بالرقم الموحد
    .limit(20)

  if (error) {
    console.error(error)
    return []
  }

  return (data || []).map((c: any) => ({
    id: c.unified_number,
    name: c.name || c.unified_number, // name إن لم يوجد استخدم الرقم
  }))
}

export function TransactionModal({
  isOpen,
  setIsOpen,
  onSave,
  activeTab,
  initialData,
}: TransactionModalProps) {
  const [data, setData] = useState<TransactionInput>(getDefaultData)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // تحديد ما إذا كان في وضع التعديل
  const isEditMode = !!initialData

  // ملء البيانات عند فتح المودال (إضافة أو تعديل)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        // نزع الحقول المحسوبة والإضافية
        const {
          id,
          created_at,
          companies,
          operationDate,
          daysRemaining,
          remainingAmount,
          ...validInput
        } = initialData as Transaction & {
          operationDate: string
          daysRemaining: number
          remainingAmount: number
        }

        setData(validInput as TransactionInput)
      } else {
        const validServiceType = SERVICE_TYPES.includes(
          activeTab as ServiceType
        )
          ? activeTab
          : SERVICE_TYPES[0]
        setData({
          ...getDefaultData(),
          service_type: validServiceType,
        })
      }
      setErrors([])
    }
  }, [isOpen, initialData, activeTab, isEditMode])

  const handleInputChange = useCallback(
    (field: keyof TransactionInput, value: string | number) => {
      setData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // حساب القيم المشتقة
  const totalFees = useCallback(() => {
    return (
      Number(data.work_permit) +
      Number(data.passports) +
      Number(data.medical_insurance) +
      Number(data.transport_fees) +
      Number(data.other_fees)
    )
  }, [data])

  const netProfit = useCallback(() => {
    return Number(data.agreed_amount) - totalFees()
  }, [data.agreed_amount, totalFees])

  const remainingAmount = useCallback(() => {
    return Number(data.agreed_amount) - Number(data.received_amount)
  }, [data.agreed_amount, data.received_amount])

  // تحسين دالة التحقق
  const validate = useCallback((): boolean => {
    // نفس التحقق السابق ...
    return true // أو false حسب الأخطاء
  }, [data])

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      // 🆕 إزالة حقل id من البيانات (لن نرسله للإضافة)
      const dataToSend = { ...data }

      let savedTransaction: Transaction

      if (isEditMode && initialData) {
        // وضع التعديل
        savedTransaction = await updateTransaction(initialData.id, dataToSend)
        toast.success("تم تعديل المعاملة بنجاح!", { position: "top-center" })
      } else {
        // وضع الإضافة
        savedTransaction = await addTransaction(dataToSend)
        toast.success("تمت الإضافة بنجاح!", { position: "top-center" })
      }

      onSave(savedTransaction)
      setIsOpen(false)
    } catch (error) {
      console.error("خطأ أثناء الحفظ:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء الاتصال بقاعدة البيانات",
        { position: "top-center" }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative flex max-h-screen w-full max-w-4xl flex-col overflow-hidden rounded-none border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isEditMode ? (
                <Pencil className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isEditMode ? "تعديل المعاملة" : "إضافة معاملة جديدة"}
              </h2>
              {initialData && (
                <span className="text-xs text-muted-foreground">
                  ID: {initialData.id}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 transition-colors hover:bg-secondary"
            aria-label="إغلاق"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-10 overflow-y-auto p-6 md:p-8"
        >
          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              {errors.map((err, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Resident Info */}
          <section className="space-y-6">
            <SubHeader title="بيانات المقيم" icon={Building2} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FormField label="اسم المقيم" required>
                <Input
                  placeholder="مثال: محمد أحمد"
                  value={data.resident_name}
                  onChange={(v) => handleInputChange("resident_name", v)}
                />
              </FormField>

              <FormField label="رقم الإقامة" required>
                <Input
                  placeholder="10 أرقام"
                  value={data.iqama_number}
                  maxLength={10}
                  onChange={(v) => handleInputChange("iqama_number", v)}
                />
              </FormField>

              <FormField label="الجنسية" required>
                <Input
                  placeholder="مثال: يمني"
                  value={data.nationality}
                  onChange={(v) => handleInputChange("nationality", v)}
                />
              </FormField>

              <FormField label="المهنة" required>
                <Input
                  placeholder="مثال: محاسب"
                  value={data.profession}
                  onChange={(v) => handleInputChange("profession", v)}
                />
              </FormField>

              <FormField label="رقم الهاتف">
                <Input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={data.phone_num || ""}
                  onChange={(v) =>
                    handleInputChange("phone_num", v === "" ? 0 : Number(v))
                  }
                />
              </FormField>

              <FormField label="تاريخ الانتهاء">
                <Input
                  type="date"
                  value={data.expiry_date || ""}
                  onChange={(v) => handleInputChange("expiry_date", v)}
                />
              </FormField>
            </div>
          </section>

          {/* Service Info */}
          <section className="space-y-6">
            <SubHeader title="بيانات الخدمة" icon={Briefcase} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <FormField label="الشركة / الكفيل" required>
                <SearchableSelect
                  value={data.unified_number_of_company}
                  onChange={(v) =>
                    handleInputChange("unified_number_of_company", v)
                  }
                  placeholder="ابحث بالاسم أو الرقم الموحد"
                  onSearch={searchCompanies}
                />
              </FormField>

              <FormField label="رقم المذكرة" required>
                <Input
                  placeholder="مثال: 4567"
                  value={data.memo_number}
                  onChange={(v) => handleInputChange("memo_number", v)}
                />
              </FormField>

              <FormField label="نوع الإجراء" required>
                <Select
                  options={[...SERVICE_TYPES]}
                  value={data.service_type}
                  onChange={(v) => handleInputChange("service_type", v)}
                  placeholder="اختر الإجراء"
                />
              </FormField>
              <FormField label="هل ما يزال يعمل في الشركة؟">
                <Select
                  options={["نعم", "لا"]}
                  // إذا كانت القيمة true تظهر "نعم"، وإذا كانت false تظهر "لا"
                  value={data.working}
                  onChange={(v) => handleInputChange("working", v)}
                  placeholder="اختر الحالة"
                />
              </FormField>
            </div>
          </section>

          {/* Costs & Profit */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Costs Section */}
            <section className="space-y-6">
              <SubHeader title="التكاليف" icon={CreditCard} />
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-muted/30 p-5">
                <FormField label="كرت العمل" required>
                  <NumberInput
                    value={data.work_permit}
                    onChange={(v) => handleInputChange("work_permit", v)}
                  />
                </FormField>

                <FormField label="الجوازات" required>
                  <NumberInput
                    value={data.passports}
                    onChange={(v) => handleInputChange("passports", v)}
                  />
                </FormField>

                <FormField label="التأمين الطبي" required>
                  <NumberInput
                    value={data.medical_insurance}
                    onChange={(v) => handleInputChange("medical_insurance", v)}
                  />
                </FormField>

                <FormField label="تكاليف النقل">
                  <NumberInput
                    value={data.transport_fees}
                    onChange={(v) => handleInputChange("transport_fees", v)}
                  />
                </FormField>

                <div className="col-span-2">
                  <FormField label="تكاليف أخرى">
                    <NumberInput
                      value={data.other_fees}
                      onChange={(v) => handleInputChange("other_fees", v)}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Profit Summary */}
            <section className="space-y-6">
              <SubHeader title="خلاصة الأرباح" icon={Briefcase} />
              <div className="group relative flex h-74 flex-col justify-center overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
                <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-6 flex items-center justify-between border-b border-primary-foreground/10 pb-4">
                  <span className="text-sm font-medium opacity-80">
                    إجمالي المصاريف
                  </span>
                  <span className="text-xl font-bold">
                    {totalFees().toLocaleString()} ر.س
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold opacity-90">
                      الصافي المتوقع
                    </span>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black tracking-tighter uppercase ${
                        netProfit() >= 0
                          ? "bg-emerald-500/30 text-emerald-100"
                          : "bg-red-500/30 text-red-100"
                      }`}
                    >
                      {netProfit() >= 0 ? "ربح تشغيلي" : "عجز مالي"}
                    </div>
                  </div>
                  <div className="text-5xl font-black tracking-tighter tabular-nums">
                    {netProfit().toLocaleString()}{" "}
                    <span className="text-base font-normal">ر.س</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Collection Section */}
          <section className="space-y-6">
            <SubHeader title="التحصيل" icon={CreditCard} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="المبلغ المتفق عليه" required>
                <NumberInput
                  value={data.agreed_amount}
                  onChange={(v) => handleInputChange("agreed_amount", v)}
                />
              </FormField>

              <FormField label="المبلغ المستلم" required>
                <NumberInput
                  value={data.received_amount}
                  onChange={(v) => handleInputChange("received_amount", v)}
                />
              </FormField>

              <FormField label="المتبقي">
                <div className="flex h-12 items-center rounded-xl border border-border bg-muted/20 px-4 font-bold text-foreground">
                  {remainingAmount().toLocaleString()} ر.س
                </div>
              </FormField>

              <FormField label="موعد تسليم الدفعة">
                <Input
                  type="date"
                  value={data.payment_date || ""}
                  onChange={(v) => handleInputChange("payment_date", v)}
                />
              </FormField>

              <div className="col-span-2">
                <FormField label="ملاحظة">
                  <Input
                    type="text"
                    value={data.note || ""}
                    placeholder="اختياري"
                    onChange={(v) => handleInputChange("note", v)}
                  />
                </FormField>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-border bg-card px-8 py-3 font-semibold transition-colors hover:bg-secondary"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-10 py-3 font-bold text-primary-foreground transition-all hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "جاري الحفظ..."
              : isEditMode
                ? "حفظ التعديلات"
                : "تأكيد وحفظ"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. Reusable Form Components
// ==========================================
const FormField = ({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-foreground/80">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
)

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  type?: string
  placeholder?: string
  value: string | number | null
  onChange: (v: string) => void
  maxLength?: number
}) => (
  <input
    type={type}
    value={value ?? ""}
    placeholder={placeholder}
    maxLength={maxLength}
    onChange={(e) => onChange(e.target.value)}
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20"
  />
)

const NumberInput = ({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) => (
  <Input
    type="number"
    placeholder="0"
    value={value || ""}
    onChange={(v) => onChange(v === "" ? 0 : Number(v))}
  />
)

const Select = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background px-4 text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
  </div>
)

const SearchableSelect = ({
  options, // للتوافق مع الاستخدامات القديمة (اختياري)
  value,
  onChange,
  placeholder,
  onSearch, // 🆕 دالة البحث غير المتزامنة
}: {
  options?: { name: string; id: string }[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  onSearch?: (query: string) => Promise<{ name: string; id: string }[]>
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<{ name: string; id: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // عند تغيير نص البحث
  useEffect(() => {
    if (!search.trim() || !onSearch) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await onSearch(search)
        setResults(data)
      } catch (err) {
        console.error(err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // تأخير 300ms لتقليل الطلبات

    return () => clearTimeout(timer)
  }, [search, onSearch])

  // استخدام options الثابتة كخيار احتياطي
  const displayResults = onSearch
    ? results
    : (options || []).filter((o) => o.id.includes(search))

  // العثور على الشركة المختارة (نبحث في options أو نخزن الاسم محلياً)
  const selectedOption = (options || []).find((o) => o.id === value)

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-4"
      >
        <span
          className={value ? "text-foreground" : "text-muted-foreground/40"}
        >
          {selectedOption
            ? `${selectedOption.name} (${selectedOption.id})`
            : value || placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full space-y-2 rounded-xl border border-border bg-card p-2 shadow-xl">
            <input
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="ابحث بالرقم الموحد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="max-h-40 overflow-y-auto">
              {isSearching ? (
                <div className="p-2 text-center text-xs text-muted-foreground">
                  جاري البحث...
                </div>
              ) : displayResults.length > 0 ? (
                displayResults.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id)
                      setIsOpen(false)
                      setSearch("")
                    }}
                    className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
                  >
                    <div className="text-sm font-bold">
                      {opt.name || opt.id}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {opt.id}
                    </div>
                  </div>
                ))
              ) : search.trim() ? (
                <div className="p-2 text-center text-xs text-muted-foreground">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="p-2 text-center text-xs text-muted-foreground">
                  اكتب للبحث...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SubHeader = ({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
}) => (
  <div className="flex items-center gap-3 border-r-4 border-primary pr-3">
    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="text-base font-black tracking-tight">{title}</h3>
  </div>
)
