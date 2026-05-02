"use client"

import ExcelImporter from "@/components/ExcelImporter/ExcelImporter"
import { TargetColumn } from "@/components/ExcelImporter/types"
import { useCompanies } from "@/hooks/useCompanies"
import { useConectCompanies } from "@/hooks/useConectCompanies"
import { useTransactions } from "@/hooks/useTransactions"

// ─────────────────────────────
// الأعمدة
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

const companyConnectColumns: TargetColumn[] = [
  { key: "com1", label: "رقم الشركة الأولى", numeric: true, required: true },
  { key: "com2", label: "رقم الشركة الثانية", numeric: true, required: true },
]

const transactionColumns: TargetColumn[] = [
  { key: "resident_name", label: "اسم المقيم", required: true },
  { key: "iqama_number", label: "رقم الإقامة", required: true },
  { key: "nationality", label: "الجنسية" },
  { key: "profession", label: "المهنة" },
  {
    key: "unified_number_of_company",
    label: "الرقم الموحد للشركة",
    required: true,
  },
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
  const { upsertCompanies, loading: companiesLoading } = useCompanies()
  const { upsertConectCompanies, loading: connectLoading } =
    useConectCompanies()
  const { upsertTransactions, loading: transactionsLoading } = useTransactions()

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-8" dir="rtl">
      {/* الشركات */}
      <Section title="استيراد الشركات" desc="تحديث أو إضافة الشركات تلقائياً">
        <ExcelImporter
          targetColumns={companyColumns}
          onImport={upsertCompanies}
          buttonLabel={
            companiesLoading ? "جاري المعالجة..." : "استيراد الشركات"
          }
        />
      </Section>

      {/* ربط الشركات */}
      <Section title="ربط الشركات" desc="ربط شركتين ببعض">
        <ExcelImporter
          targetColumns={companyConnectColumns}
          onImport={upsertConectCompanies}
          buttonLabel={connectLoading ? "جاري المعالجة..." : "استيراد الربط"}
        />
      </Section>

      {/* العمليات */}
      <Section title="استيراد العمليات" desc="إضافة أو تحديث بيانات المقيمين">
        <ExcelImporter
          targetColumns={transactionColumns}
          onImport={upsertTransactions}
          buttonLabel={
            transactionsLoading ? "جاري المعالجة..." : "استيراد العمليات"
          }
        />
      </Section>
    </div>
  )
}

// ─────────────────────────────
// Component مساعد
// ─────────────────────────────
function Section({ title, desc, children }: any) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">{desc}</p>
      {children}
    </div>
  )
}
