"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Building2,
  User,
  Hash,
  Calendar,
  Plus,
  X,
  AlertCircle,
  Pencil,
  CreditCard,
  Newspaper,
} from "lucide-react"
import { toast } from "sonner"
import { Company } from "@/hooks/useCompanies"
import { CompanyInput, addCompany, updateCompany } from "./upload"
import { getPrice } from "@/lib/defalutValues"

const ENTITY_TYPES = ["مؤسسة فردية", "شركة ذات مسؤولية محدودة"] as const

const getDefaultData = (): CompanyInput => ({
  unified_number: "",
  establishment_number: "",
  social_insurance_number: "",
  company_owner: "",
  entity_type: ENTITY_TYPES[0],
  crNumber: 0,
  cr_expiry_date: null,
  government_fees: 0,
  commercial_register_fees: getPrice("commercial_register_fees") | 0,
  qiwa: getPrice("qiwa") | 0,
  muqeem: getPrice("muqeem") | 0,
  newspaper_price: 0,
  exemption_amount: 0,
})

interface CompanyModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onSave: (company: Company) => void
  initialData?: Company | null
}

export function CompanyModal({
  isOpen,
  setIsOpen,
  onSave,
  initialData,
}: CompanyModalProps) {
  const [data, setData] = useState<CompanyInput>(getDefaultData())
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!initialData

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        // استخراج الحقول المسموح بإدخالها فقط
        const {
          unified_number,
          establishment_number,
          social_insurance_number,
          company_owner,
          entity_type,
          crNumber,
          cr_expiry_date,
          government_fees,
          commercial_register_fees,
          qiwa,
          muqeem,
          newspaper_price,
          exemption_amount,
        } = initialData

        setData({
          unified_number: unified_number || "",
          establishment_number: establishment_number || "",
          social_insurance_number: social_insurance_number || "",
          company_owner: company_owner || "",
          entity_type: entity_type || ENTITY_TYPES[0],
          crNumber: crNumber || 0,
          cr_expiry_date: cr_expiry_date || null,
          government_fees: government_fees || 0,
          commercial_register_fees: commercial_register_fees || 0,
          qiwa: qiwa || 0,
          muqeem: muqeem || 0,
          newspaper_price: newspaper_price || 0,
          exemption_amount: exemption_amount || 0,
        })
      } else {
        setData(getDefaultData())
      }
      setErrors([])
    }
  }, [isOpen, initialData, isEditMode])

  const handleInputChange = useCallback(
    (field: keyof CompanyInput, value: string | number) => {
      setData((prev: any) => ({ ...prev, [field]: value }))
    },
    []
  )

  const validate = useCallback((): boolean => {
    const newErrors: string[] = []
    if (!data.unified_number?.trim()) newErrors.push("الرقم الموحد مطلوب")
    if (!data.company_owner?.trim()) newErrors.push("اسم مالك الشركة مطلوب")
    if (!data.establishment_number?.trim()) newErrors.push("رقم المنشأة مطلوب")
    if (!data.social_insurance_number?.trim())
      newErrors.push("رقم التأمينات مطلوب")
    if (!data.entity_type) newErrors.push("نوع الكيان مطلوب")

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return false
    }
    setErrors([])
    return true
  }, [data])

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)

    try {
      const res =
        isEditMode && initialData
          ? await updateCompany(initialData.id, data)
          : await addCompany(data)
      onSave(res)
      setIsOpen(false)
      toast.success(
        isEditMode ? "تم تعديل بيانات الشركة" : "تمت إضافة الشركة بنجاح"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />
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
              <h2 className="text-xl font-bold">
                {isEditMode ? "تعديل شركة" : "إضافة شركة جديدة"}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-10 overflow-y-auto p-6 md:p-8">
          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              {errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* البيانات الأساسية */}
          <section className="space-y-6">
            <SubHeader title="بيانات المنشأة" icon={Building2} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <FormField label="الرقم الموحد" required>
                <Input
                  value={data.unified_number}
                  onChange={(v) => handleInputChange("unified_number", v)}
                />
              </FormField>
              <FormField label="رقم المنشأة" required>
                <Input
                  value={data.establishment_number}
                  onChange={(v) => handleInputChange("establishment_number", v)}
                />
              </FormField>
              <FormField label="رقم التأمينات" required>
                <Input
                  value={data.social_insurance_number}
                  onChange={(v) =>
                    handleInputChange("social_insurance_number", v)
                  }
                />
              </FormField>
              <FormField label="مالك الشركة" required>
                <Input
                  value={data.company_owner}
                  onChange={(v) => handleInputChange("company_owner", v)}
                />
              </FormField>
              <FormField label="نوع الكيان" required>
                <Select
                  options={ENTITY_TYPES}
                  value={data.entity_type}
                  onChange={(v) => handleInputChange("entity_type", v)}
                />
              </FormField>
              <FormField label="رقم السجل التجاري">
                <Input
                  type="number"
                  value={data.crNumber ? String(data.crNumber) : ""}
                  onChange={(v) =>
                    handleInputChange("crNumber", v === "" ? 0 : Number(v))
                  }
                />
              </FormField>
              <FormField label="تاريخ انتهاء السجل">
                <Input
                  type="date"
                  value={data.cr_expiry_date || ""}
                  onChange={(v) => handleInputChange("cr_expiry_date", v)}
                />
              </FormField>
            </div>
          </section>

          {/* التكاليف والإعفاءات (بما فيها سعر الجريدة) */}
          <section className="space-y-6">
            <SubHeader title="التكاليف والإعفاءات" icon={CreditCard} />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <FormField label="رسوم حكومية">
                <NumberInput
                  value={data.government_fees}
                  onChange={(v) => handleInputChange("government_fees", v)}
                />
              </FormField>

              <FormField label="سعر الجريدة">
                <NumberInput
                  value={data.newspaper_price}
                  onChange={(v) => handleInputChange("newspaper_price", v)}
                />
              </FormField>
              <FormField label="مبلغ الإعفاء">
                <NumberInput
                  value={data.exemption_amount}
                  onChange={(v) => handleInputChange("exemption_amount", v)}
                />
              </FormField>
              <FormField label="رسوم السجل التجاري">
                <NumberInput
                  value={data.commercial_register_fees}
                  onChange={(v) =>
                    handleInputChange("commercial_register_fees", v)
                  }
                />
              </FormField>
              <FormField label="قوى">
                <NumberInput
                  value={data.qiwa}
                  onChange={(v) => handleInputChange("qiwa", v)}
                />
              </FormField>
              <FormField label="مقيم">
                <NumberInput
                  value={data.muqeem}
                  onChange={(v) => handleInputChange("muqeem", v)}
                />
              </FormField>
            </div>
          </section>

          {/* إزالة قسم الإحصائيات بالكامل */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-border bg-card px-8 py-3 font-semibold hover:bg-secondary"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-10 py-3 font-bold text-primary-foreground hover:shadow-lg active:scale-95 disabled:opacity-50"
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

// ============== مكونات مساعدة ==============
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
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
  />
)

const NumberInput = ({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) => (
  <input
    type="number"
    value={value || ""}
    placeholder="0"
    onChange={(e) =>
      onChange(e.target.value === "" ? 0 : Number(e.target.value))
    }
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
  />
)

const Select = ({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background px-4 outline-none focus:ring-2 focus:ring-primary/20"
  >
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
)

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
