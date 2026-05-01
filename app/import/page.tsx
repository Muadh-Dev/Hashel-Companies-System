"use client"

import ExcelImporter from "@/components/ExcelImporter/ExcelImporter"
import { TargetColumn } from "@/components/ExcelImporter/types"
import { useCompanies } from "@/hooks/useCompanies"

// ──────────────────────────────────────────────────────────────
// تعريف الأعمدة المستهدفة
// required: true  →  يُحذَّر المستخدم إن لم يعيّن هذا العمود
// numeric: true   →  تُحوَّل القيمة تلقائياً إلى رقم عند الاستيراد
// ──────────────────────────────────────────────────────────────
const companyColumns: TargetColumn[] = [
  { key: "unified_number",         label: "الرقم الموحد",            required: true },
  { key: "establishment_number",   label: "رقم المنشأة" },
  { key: "social_insurance_number",label: "رقم التأمينات الاجتماعية" },
  { key: "company_owner",          label: "مالك الشركة" },
  { key: "entity_type",            label: "نوع الكيان" },
  { key: "crNumber",               label: "رقم السجل التجاري",       numeric: true },
  { key: "cr_expiry_date",         label: "تاريخ انتهاء السجل" },
  { key: "government_fees",        label: "الرسوم الحكومية",         numeric: true },
  { key: "commercial_register_fees",label:"رسوم السجل التجاري",      numeric: true },
  { key: "qiwa",                   label: "رسوم قوى",                numeric: true },
  { key: "muqeem",                 label: "رسوم مقيم",               numeric: true },
  { key: "exemption_amount",       label: "مبلغ الإعفاء",            numeric: true },
  { key: "newspaper_price",        label: "سعر الصحيفة",             numeric: true },
  { key: "employees_count",        label: "عدد الموظفين",            numeric: true },
]

// ──────────────────────────────────────────────────────────────
// مثال على جدول آخر — فقط غيّر الأعمدة والهوك
// ──────────────────────────────────────────────────────────────
// import { useUpsert } from "@/hooks/useUpsert"
// const { upsert, loading } = useUpsert({
//   table: "employees",
//   conflictColumn: "national_id",
// })
// ──────────────────────────────────────────────────────────────

export default function ImportPage() {
  const { upsertCompanies, loading } = useCompanies()

  return (
    <div className="mx-auto max-w-7xl p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          استيراد بيانات الشركات
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          يتم تحديث الشركات الموجودة مسبقاً بناءً على الرقم الموحد، وإضافة الجديدة
          تلقائياً.
        </p>
      </div>

      <ExcelImporter
        targetColumns={companyColumns}
        onImport={upsertCompanies}
        buttonLabel={loading ? "جاري المعالجة..." : "حفظ وتحديث البيانات"}
      />
    </div>
  )
}
