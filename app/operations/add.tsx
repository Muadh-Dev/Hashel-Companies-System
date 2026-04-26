"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Briefcase,
  Building2,
  CreditCard,
  Plus,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react"

// ==========================================
// 1. Interfaces & Types
// ==========================================
export interface TransactionData {
  id: string
  residentName: string
  phone_num: number
  payment_date: string | null
  iqamaNumber: string
  nationality: string
  profession: string
  expiryDate: string | null
  company: string
  memoNumber: string
  serviceType: string
  workPermit: number
  passports: number
  medicalInsurance: number
  transportFees: number
  otherFees: number
  agreedAmount: number
  receivedAmount: number
  note: string
}

const defaultData: TransactionData = {
  id: "",
  residentName: "",
  phone_num: 0,
  payment_date: null,
  iqamaNumber: "",
  nationality: "",
  profession: "",
  expiryDate: null,
  company: "",
  memoNumber: "",
  serviceType: "",
  workPermit: 0,
  passports: 0,
  medicalInsurance: 0,
  transportFees: 0,
  otherFees: 0,
  agreedAmount: 0,
  receivedAmount: 0,
  note: "",
}
import { addTransaction } from "./upload"

const SERVICE_TYPES = ["نقل كفالة", "إصدار تأشيرة", "تجديد سنوي"]

const COMPANIES = [{ name: "هاشل اليامي", id: "7051022502" }]

// ==========================================
// 3. Modal Component
// ==========================================
export function TransactionModal({
  isOpen,
  setIsOpen,
  onSave,
  activeTab,
}: {
  isOpen: boolean
  setIsOpen: (o: boolean) => void
  onSave: (d: TransactionData) => void
  activeTab: string
}) {
  const [data, setData] = useState<TransactionData>({
    ...defaultData,
    id: Math.random().toString(36).substr(2, 6).toUpperCase(),
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setData({
        ...defaultData,
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      })
      setErrors([])

      handleInputChange("serviceType", activeTab)
    }
  }, [isOpen])

  const handleInputChange = (
    field: keyof TransactionData,
    value: string | number
  ) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const totalFees =
    Number(data.workPermit) +
    Number(data.passports) +
    Number(data.medicalInsurance) +
    Number(data.transportFees) +
    Number(data.otherFees)
  const netProfit = Number(data.agreedAmount) - totalFees
  const remainingAmount =
    Number(data.agreedAmount) - Number(data.receivedAmount)

  const validate = () => {
    const newErrors = []
    if (!data.residentName) newErrors.push("اسم المقيم مطلوب")
    if (!data.iqamaNumber || data.iqamaNumber.length !== 10)
      newErrors.push("رقم الإقامة يجب أن يكون 10 أرقام")
    if (!data.nationality) newErrors.push("الجنسية مطلوبة")
    if (!data.profession) newErrors.push("المهنة مطلوبة")
    if (!data.company) newErrors.push("يجب اختيار الشركة")
    if (!data.memoNumber) newErrors.push("رقم المذكرة مطلوب")
    if (!data.serviceType) newErrors.push("نوع الإجراء مطلوب")
    if (!data.agreedAmount || data.agreedAmount <= 0)
      newErrors.push("المبلغ المتفق عليه مطلوب ولا يمكن أن يكون صفراً")

    // ✨ تمرير إلى الأعلى عند وجود أخطاء
    if (newErrors.length > 0) {
      setErrors(newErrors)
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // نمرر الحاوية نفسها إلى الصفر
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      }, 100)
      return false
    }
    return true
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative flex max-h-screen w-full max-w-4xl animate-in flex-col overflow-hidden rounded-none border border-border bg-card text-card-foreground shadow-2xl zoom-in-95 fade-in sm:max-h-[92vh] sm:rounded-[2rem]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                إضافة معاملة جديدة
              </h2>
              <span className="text-xs text-muted-foreground">
                ID: {data.id}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 transition-colors hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-10 overflow-y-auto p-6 md:p-8"
        >
          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              {errors.map((err) => (
                <div
                  key={err}
                  className="flex items-center gap-2 text-sm font-bold text-destructive"
                >
                  <AlertCircle className="h-4 w-4" /> {err}
                </div>
              ))}
            </div>
          )}

          <section className="space-y-6">
            <SubHeader title="بيانات المقيم" icon={Building2} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label text="اسم المقيم" required />
                <Input
                  placeholder="مثال: محمد أحمد"
                  value={data.residentName}
                  onChange={(v: string) => handleInputChange("residentName", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="رقم الإقامة" required />
                <Input
                  placeholder="10 أرقام"
                  value={data.iqamaNumber}
                  maxLength={10}
                  onChange={(v: string) => handleInputChange("iqamaNumber", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="الجنسية" required />
                <Input
                  placeholder="مثال: يمني"
                  value={data.nationality}
                  onChange={(v: string) => handleInputChange("nationality", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="المهنة" required />
                <Input
                  placeholder="مثال: محاسب"
                  value={data.profession}
                  onChange={(v: string) => handleInputChange("profession", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="رقم الهاتف" />
                <Input
                  placeholder="رقم الهاتف"
                  value={data.phone_num}
                  onChange={(v: string) => handleInputChange("phone_num", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="تاريخ الانتهاء" />
                <Input
                  type="date"
                  value={data.expiryDate || ""}
                  onChange={(v: string) => handleInputChange("expiryDate", v)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <SubHeader title="بيانات الخدمة" icon={Briefcase} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label text="الشركة / الكفيل" required />
                <SearchableSelect
                  options={COMPANIES}
                  value={data.company}
                  onChange={(v: string) => handleInputChange("company", v)}
                  placeholder="ابحث بالاسم أو الرقم الموحد"
                />
              </div>
              <div className="space-y-2">
                <Label text="رقم المذكرة" required />
                <Input
                  placeholder="مثال: 4567"
                  value={data.memoNumber}
                  onChange={(v: string) => handleInputChange("memoNumber", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="نوع الإجراء" required />
                <Select
                  options={SERVICE_TYPES}
                  value={data.serviceType}
                  onChange={(v: string) => handleInputChange("serviceType", v)}
                  placeholder="اختر الإجراء"
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              <SubHeader title="التكاليف" icon={CreditCard} />
              <div className="grid grid-cols-2 gap-4 rounded-[1.5rem] border border-border/50 bg-muted/30 p-5">
                <div className="space-y-1.5">
                  <Label text="كرت العمل" required />
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.workPermit}
                    onChange={(v: string) =>
                      handleInputChange("workPermit", parseFloat(v) || 0)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label text="الجوازات" required />
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.passports}
                    onChange={(v: string) =>
                      handleInputChange("passports", parseFloat(v) || 0)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label text="التأمين الطبي" required />
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.medicalInsurance}
                    onChange={(v: string) =>
                      handleInputChange("medicalInsurance", parseFloat(v) || 0)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label text="تكاليف النقل" />
                  <Input
                    type="number"
                    value={data.transportFees || ""}
                    placeholder="اختياري"
                    onChange={(v: string) =>
                      handleInputChange("transportFees", parseFloat(v) || 0)
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label text="تكاليف أخرى" />
                  <Input
                    type="number"
                    value={data.otherFees || ""}
                    placeholder="اختياري"
                    onChange={(v: string) =>
                      handleInputChange("otherFees", parseFloat(v) || 0)
                    }
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SubHeader title="خلاصة الأرباح" icon={Briefcase} />
              <div className="group relative flex h-74 flex-col justify-center overflow-hidden rounded-[1.5rem] bg-primary p-8 text-primary-foreground">
                <div className="absolute top-0 left-0 h-full w-full bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-6 flex items-center justify-between border-b border-primary-foreground/10 pb-4">
                  <span className="text-sm font-medium opacity-80">
                    إجمالي المصاريف
                  </span>
                  <span className="text-xl font-bold">
                    {totalFees.toLocaleString()} ر.س
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold opacity-90">
                      الصافي المتوقع
                    </span>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black tracking-tighter uppercase ${netProfit >= 0 ? "bg-emerald-500/30 text-emerald-100" : "bg-red-500/30 text-red-100"}`}
                    >
                      {netProfit >= 0 ? "ربح تشغيلي" : "عجز مالي"}
                    </div>
                  </div>
                  <div className="text-5xl font-black tracking-tighter tabular-nums">
                    {netProfit.toLocaleString()}{" "}
                    <span className="text-base font-normal">ر.س</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-6">
            <SubHeader title="التحصيل" icon={CreditCard} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label text="المبلغ المتفق عليه" required />
                <Input
                  type="number"
                  placeholder="0"
                  value={data.agreedAmount}
                  onChange={(v: string) =>
                    handleInputChange("agreedAmount", parseFloat(v) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label text="المبلغ المستلم" required />
                <Input
                  type="number"
                  placeholder="0"
                  value={data.receivedAmount}
                  onChange={(v: string) =>
                    handleInputChange("receivedAmount", parseFloat(v) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label text="المتبقي" />
                <div className="flex h-12 items-center rounded-xl border border-border bg-muted/20 px-4 font-bold text-foreground">
                  {remainingAmount.toLocaleString()} ر.س
                </div>
              </div>
              <div className="space-y-2">
                <Label text="موعد تسليم الدفعة" />
                <Input
                  type="date"
                  value={data.payment_date || ""}
                  onChange={(v: string) => handleInputChange("payment_date", v)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label text="ملاحظة" />
                <Input
                  type="text"
                  value={data.note || ""}
                  placeholder="اختياري"
                  onChange={(v: string) => handleInputChange("note", v)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-border bg-card px-8 py-3 font-semibold"
          >
            إلغاء
          </button>
          <button
            disabled={isSubmitting}
            onClick={async () => {
              // 1. التأكد من صحة الحقول
              if (validate()) {
                setIsSubmitting(true)
                try {
                  await addTransaction(data)
                  onSave(data)
                  setIsOpen(false)

                  console.log("تم الرفع والحفظ بنجاح!")
                } catch (error) {
                  console.error("خطأ أثناء الرفع:", error)
                  alert("حدث خطأ أثناء الاتصال بقاعدة البيانات")
                } finally {
                  setIsSubmitting(false)
                }
              }
            }}
            className="rounded-xl bg-primary px-10 py-3 font-bold text-primary-foreground transition-all hover:shadow-lg active:scale-95"
          >
            تأكيد وحفظ
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. UI Helpers
// ==========================================
const Label = ({
  text,
  small,
  required,
}: {
  text: string
  small?: boolean
  required?: boolean
}) => (
  <label
    className={`block font-bold text-foreground/80 ${small ? "text-[11px]" : "text-sm"}`}
  >
    {text} {required && <span className="text-destructive">*</span>}
  </label>
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
  value: string | number
  onChange: (v: string) => void
  maxLength?: number
}) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    maxLength={maxLength}
    onChange={(e) => onChange(e.target.value)}
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20"
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
  <div className="group relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background px-4 text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
  </div>
)

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { name: string; id: string }[]
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const filtered = options.filter(
    (o) => o.name.includes(search) || o.id.includes(search)
  )

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-4"
      >
        <span
          className={value ? "text-foreground" : "text-muted-foreground/40"}
        >
          {value || placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full space-y-2 rounded-xl border border-border bg-card p-2 shadow-xl">
          <input
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
            placeholder="ابحث بالاسم أو الـ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.name)
                    setIsOpen(false)
                  }}
                  className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
                >
                  <div className="text-sm font-bold">{opt.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    ID: {opt.id}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-xs text-muted-foreground">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SubHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-3 border-r-4 border-primary pr-3">
    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="text-base font-black tracking-tight">{title}</h3>
  </div>
)
