"use client"

import ExcelImporter from "@/components/ExcelImporter/ExcelImporter"
import { TargetColumn } from "@/components/ExcelImporter/types"
import { useCompanies } from "@/hooks/useCompanies"
import { useConectCompanies } from "@/hooks/useConectCompanies"
import { useTransactions } from "@/hooks/useTransactions"
import { useState } from "react"

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
  { key: "government_fees", label: "الرسوم الحكومية", numeric: true },
  {
    key: "commercial_register_fees",
    label: "رسوم السجل التجاري",
    numeric: true,
  },
  { key: "qiwa", label: "رسوم قوى", numeric: true },
  { key: "muqeem", label: "رسوم مقيم", numeric: true },
  { key: "exemption_amount", label: "مبلغ الإعفاء", numeric: true },
  { key: "newspaper_price", label: "رسوم النشر في الصحف", numeric: true },
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
  { key: "iqama_number", label: "رقم الإقامة" },
  {
    key: "unified_number_of_company",
    label: "رقم الشركة الموحد",
    required: true,
  },
  { key: "nationality", label: "الجنسية" },
  { key: "profession", label: "المهنة" },
  { key: "phone_num", label: "الجوال", numeric: true },
  { key: "memo_number", label: "رقم المذكرة" },
  { key: "tashira_number", label: "رقم التأشيرة" },
  { key: "hodod_number", label: "رقم الحدود" },
  { key: "work_permit", label: "رخصة عمل", numeric: true },
  { key: "passports", label: "الجوازات", numeric: true },
  { key: "medical_insurance", label: "تأمين طبي", numeric: true },
  { key: "iqama", label: "رسوم الإقامة", numeric: true },
  { key: "transport_fees", label: "رسوم النقل", numeric: true },
  { key: "other_fees", label: "رسوم أخرى", numeric: true },
  { key: "agreed_amount", label: "المتفق عليه", numeric: true },
  { key: "received_amount", label: "المبلغ المستلم", numeric: true },
  { key: "note", label: "ملاحظات" },
  { key: "Wresident_name", label: "اسم الوسيط" },
  { key: "Wiqama_number", label: "رقم إقامة الوسط" },
  { key: "Wphone_num", label: "جوال الوسيط", numeric: true },
]

// ─────────────────────────────
// الصفحة
// ─────────────────────────────
export default function ImportPage() {
  const { upsertCompanies } = useCompanies()
  const { upsertConectCompanies } = useConectCompanies()
  const { upsertTransactions } = useTransactions()
  const [serviceType, setServiceType] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-8" dir="rtl">
      <Section
        title="استيراد الشركات"
        desc="تحديث أو إضافة الشركات بناءً على الرقم الموحد"
        downloadUrl="/قالب-الشركات.xlsx"
      >
        <ExcelImporter
          targetColumns={companyColumns}
          onImport={(data, onProgress) => upsertCompanies(data, onProgress)}
          buttonLabel="استيراد الشركات"
        />
      </Section>

      <Section
        title="استيراد ربط الشركات"
        desc="إضافة روابط بين شركتين"
        downloadUrl="/قالب-الشركات-المرتبطة.xlsx"
      >
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
        downloadUrl="/قالب-المعاملات.xlsx"
      >
        {/* أزرار نوع الخدمة */}
        <div className="mb-4 flex gap-2">
          {["نقل كفالة", "تجديد سنوي", "إصدار تأشيرة"].map((type) => (
            <button
              key={type}
              onClick={() =>
                setServiceType((prev) => (prev === type ? null : type))
              }
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all ${
                serviceType === type
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              {type}
            </button>
          ))}
          {serviceType && (
            <span className="self-center text-xs text-slate-400">
              سيُحقن في كل الصفوف تلقائياً
            </span>
          )}
        </div>
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
  downloadUrl,
  children,
}: {
  title: string
  desc: string
  downloadUrl: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
      {/* الجزء العلوي: النص والزر */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* جهة النصوص */}
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
        </div>

        {/* جهة زر التحميل */}
        <a
          href={downloadUrl} // تأكد من وضع الملف في مجلد public
          download
          className="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-700 hover:shadow active:scale-95"
        >
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          تحميل قالب الإكسل
        </a>
      </div>

      {/* الجزء السفلي: الأبناء */}
      <div className="mt-4">{children}</div>
    </section>
  )
}
