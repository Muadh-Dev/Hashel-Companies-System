"use client"

import ExcelImporter from "@/components/ExcelImporter/ExcelImporter"
import { TargetColumn } from "@/components/ExcelImporter/types"
import { useCompanies } from "@/hooks/useCompanies"
import { useConectCompanies } from "@/hooks/useConectCompanies"
import { useTransactions } from "@/hooks/useTransactions"

// ─────────────────────────────
// أعمدة الشركات
// ─────────────────────────────
const companyColumns: TargetColumn[] = [
  { key: "unified_number", label: "الرقم الموحد", required: true },
  { key: "establishment_number", label: "رقم المنشأة", required: true },
  {
    key: "social_insurance_number",
    label: "رقم التأمينات الاجتماعية",
    required: true,
  },
  { key: "company_owner", label: "مالك الشركة" },
  { key: "entity_type", label: "نوع الكيان" },
  { key: "crNumber", label: "رقم السجل التجاري", numeric: true },
  { key: "cr_expiry_date", label: "تاريخ انتهاء السجل" },
  { key: "government_fees", label: "الرسوم الحكومية", numeric: true },
  {
    key: "commercial_register_fees",
    label: "رسوم السجل التجاري",
    numeric: true,
  },
  { key: "qiwa", label: "رسوم قوى", numeric: true },
  { key: "muqeem", label: "رسوم مقيم", numeric: true },
  { key: "exemption_amount", label: "مبلغ الإعفاء", numeric: true },
  { key: "newspaper_price", label: "رسوم النشر", numeric: true },
  { key: "employees_count", label: "عدد الموظفين", numeric: true },
]

// ─────────────────────────────
// أعمدة ربط الشركات
// ─────────────────────────────
const companyConnectColumns: TargetColumn[] = [
  { key: "com1", label: "رقم الشركة الأولى", numeric: true, required: true },
  { key: "com2", label: "رقم الشركة الثانية", numeric: true, required: true },
]

// ─────────────────────────────
// أعمدة المعاملات
// ─────────────────────────────
const transactionColumns: TargetColumn[] = [
  { key: "resident_name", label: "اسم المقيم", required: true },
  { key: "iqama_number", label: "رقم الإقامة", required: true },
  {
    key: "unified_number_of_company",
    label: "الرقم الموحد للشركة",
    required: true,
  },
  { key: "nationality", label: "الجنسية" },
  { key: "profession", label: "المهنة" },
  { key: "service_type", label: "نوع الخدمة" },
  { key: "expiry_date", label: "تاريخ الانتهاء" },
  { key: "payment_date", label: "تاريخ السداد" },
  { key: "memo_number", label: "رقم المذكرة" },
  { key: "tashira_number", label: "رقم التأشيرة" },
  { key: "hodod_number", label: "رقم الحدود" },
  { key: "working", label: "يعمل حالياً؟" },
  { key: "work_permit", label: "رخصة العمل", numeric: true },
  { key: "passports", label: "الجوازات", numeric: true },
  { key: "medical_insurance", label: "التأمين الطبي", numeric: true },
  { key: "transport_fees", label: "رسوم النقل", numeric: true },
  { key: "other_fees", label: "رسوم أخرى", numeric: true },
  { key: "agreed_amount", label: "المبلغ المتفق", numeric: true },
  { key: "received_amount", label: "المبلغ المستلم", numeric: true },
  { key: "phone_num", label: "الجوال", numeric: true },
  { key: "note", label: "ملاحظات" },
]

// ─────────────────────────────
// الصفحة
// ─────────────────────────────
export default function ImportPage() {
  const { upsertCompanies } = useCompanies()
  const { upsertConectCompanies } = useConectCompanies()
  const { upsertTransactions } = useTransactions()

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-8" dir="rtl">
      <Section
        title="استيراد الشركات"
        desc="تحديث أو إضافة الشركات بناءً على الرقم الموحد"
      >
        <ExcelImporter
          targetColumns={companyColumns}
          onImport={(data, onProgress) => upsertCompanies(data, onProgress)}
          buttonLabel="استيراد الشركات"
        />
      </Section>

      <Section title="ربط الشركات" desc="إضافة روابط بين شركتين">
        <ExcelImporter
          targetColumns={companyConnectColumns}
          onImport={(data, onProgress) =>
            upsertConectCompanies(data, onProgress)
          }
          buttonLabel="استيراد الربط"
        />
      </Section>

      <Section
        title="استيراد المعاملات"
        desc="إضافة أو تحديث بيانات المقيمين بناءً على رقم الإقامة"
      >
        <ExcelImporter
          targetColumns={transactionColumns}
          onImport={(data, onProgress) => upsertTransactions(data, onProgress)}
          buttonLabel="استيراد المعاملات"
        />
      </Section>
    </div>
  )
}

// ─────────────────────────────
// مكوّن مساعد
// ─────────────────────────────
function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">{desc}</p>
      {children}
    </section>
  )
}
