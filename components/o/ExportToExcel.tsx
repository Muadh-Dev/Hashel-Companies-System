// components/ExportToExcel.tsx
"use client"

import { useState } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

// تعريف النوع مطابق تماماً لـ useTransactions.ts
type Company = {
  establishment_number: string
  social_insurance_number: string
}

type Transaction = {
  id: string
  resident_name: string
  Wresident_name: string
  iqama_number: string
  Wiqama_number: string
  nationality: string
  profession: string
  expiry_date: string | null
  payment_date: string | null
  unified_number_of_company: string
  companies: Company | null
  memo_number: string | null
  service_type: string
  work_permit: number
  passports: number
  phone_num: string
  Wphone_num: string
  iqama: number
  medical_insurance: number
  medical_examination: number
  transport_fees: number
  other_fees: number
  agreed_amount: number
  tashira_fees: number
  received_amount: number
  note: string
  created_at: string
  working: string
  tashira_number: string
  hodod_number: string
}

export default function ExportToExcel() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, companies(establishment_number,social_insurance_number)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("خطأ في جلب البيانات:", error)
      throw new Error("فشل في جلب البيانات من قاعدة البيانات")
    }

    return data || []
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const transactions = await fetchTransactions()

      if (!transactions || transactions.length === 0) {
        alert("لا توجد بيانات للتصدير")
        setIsExporting(false)
        return
      }

      const workbook = new ExcelJS.Workbook()
      workbook.creator = "نظام المعاملات"
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet("المعاملات", {
        properties: { tabColor: { argb: "2E86C1" } },
        views: [{ state: "frozen", ySplit: 1 }],
      })

      // تعريف الأعمدة (تمت إضافة الأعمدة الجديدة)
      const columns = [
        // المجموعة 1: معلومات أساسية
        { header: "تاريخ العملية", key: "created_at", width: 15, group: 1 },
        { header: "اسم المقيم", key: "resident_name", width: 25, group: 1 },
        { header: "رقم الإقامة", key: "iqama_number", width: 15, group: 1 },
        { header: "الجنسية", key: "nationality", width: 12, group: 1 },
        { header: "المهنة", key: "profession", width: 20, group: 1 },
        { header: "رقم الجوال", key: "phone_num", width: 12, group: 1 },

        // المجموعة 2: تفاصيل الخدمة والإقامة
        { header: "نوع الخدمة", key: "service_type", width: 15, group: 2 },
        { header: "انتهاء الإقامة", key: "expiry_date", width: 15, group: 2 },
        {
          header: "المتبقي (أيام)",
          key: "remaining_days",
          width: 12,
          group: 2,
        },
        { header: "رقم التأشيرة", key: "tashira_number", width: 15, group: 2 },
        { header: "رقم الحدود", key: "hodod_number", width: 15, group: 2 },
        { header: "حالة العمل", key: "working", width: 12, group: 2 }, // working: نص

        // المجموعة 3: الرسوم (تمت إضافة Medical Exam, Iqama, Tashira Fees)
        { header: "رخصة عمل", key: "work_permit", width: 12, group: 3 },
        { header: "جوازات", key: "passports", width: 10, group: 3 },
        { header: "تأمين طبي", key: "medical_insurance", width: 12, group: 3 },
        { header: "كشف طبي", key: "medical_examination", width: 12, group: 3 },
        { header: "رسوم الإقامة", key: "iqama", width: 12, group: 3 },
        { header: "إصدار تأشيرة", key: "tashira_fees", width: 12, group: 3 },
        { header: "نقل", key: "transport_fees", width: 10, group: 3 },
        { header: "أخرى", key: "other_fees", width: 10, group: 3 },
        { header: "الإجمالي", key: "total", width: 12, group: 3 },

        // المجموعة 4: المدفوعات
        { header: "المتفق عليه", key: "agreed_amount", width: 12, group: 4 },
        { header: "المستلم", key: "received_amount", width: 12, group: 4 },
        { header: "المتبقي", key: "remaining", width: 12, group: 4 },
        { header: "حالة الدفع", key: "payment_status", width: 12, group: 4 },
        {
          header: "تاريخ استلام الدفعة",
          key: "payment_date",
          width: 15,
          group: 4,
        },

        // المجموعة 5: معلومات الشركة
        {
          header: "رقم الشركة الموحد",
          key: "unified_number_of_company",
          width: 15,
          group: 5,
        },
        {
          header: "رقم المنشأة",
          key: "establishment_number",
          width: 15,
          group: 5,
        },
        {
          header: "رقم التأمين",
          key: "social_insurance_number",
          width: 15,
          group: 5,
        },

        // المجموعة 6: بيانات الوسيط (جديدة)
        { header: "اسم الوسيط", key: "Wresident_name", width: 20, group: 6 },
        {
          header: "رقم إقامة الوسيط",
          key: "Wiqama_number",
          width: 15,
          group: 6,
        },
        { header: "جوال الوسيط", key: "Wphone_num", width: 12, group: 6 },

        // المجموعة 7: ملاحظات أخرى
        { header: "مذكرة", key: "memo_number", width: 15, group: 7 },
        { header: "ملاحظة", key: "note", width: 30, group: 7 },
      ]

      worksheet.columns = columns

      // تنسيق رأس الجدول والألوان (نفس السابق لكن مع زيادة المجموعات)
      const headerRow = worksheet.getRow(1)
      headerRow.height = 30
      headerRow.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFF" },
      }
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      }
      headerRow.border = {
        top: { style: "thin", color: { argb: "CCCCCC" } },
        left: { style: "thin", color: { argb: "CCCCCC" } },
        bottom: { style: "thin", color: { argb: "CCCCCC" } },
        right: { style: "thin", color: { argb: "CCCCCC" } },
      }

      const groupColors: { [key: number]: string } = {
        1: "2196F3", // أزرق - معلومات أساسية
        2: "4CAF50", // أخضر - تفاصيل الخدمة والتأشيرة
        3: "FF9800", // برتقالي - الرسوم والإجمالي
        4: "9C27B0", // أرجواني - المدفوعات
        5: "607D8B", // رمادي مزرق - معلومات الشركة
        6: "00BCD4", // فيروزي - بيانات الوسيط
        7: "757575", // رمادي - ملاحظات
      }

      columns.forEach((col: any, index: number) => {
        const cell = headerRow.getCell(index + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: groupColors[col.group] },
        }
      })

      // إضافة البيانات مع الحسابات الصحيحة
      transactions.forEach((transaction: Transaction) => {
        // استخراج جميع الرسوم (بما فيها الجديدة)
        const workPermit = Number(transaction.work_permit) || 0
        const passports = Number(transaction.passports) || 0
        const medicalInsurance = Number(transaction.medical_insurance) || 0
        const medicalExamination = Number(transaction.medical_examination) || 0
        const iqamaFee = Number(transaction.iqama) || 0
        const tashiraFee = Number(transaction.tashira_fees) || 0
        const transportFees = Number(transaction.transport_fees) || 0
        const otherFees = Number(transaction.other_fees) || 0

        const totalAmount =
          workPermit +
          passports +
          medicalInsurance +
          medicalExamination +
          iqamaFee +
          tashiraFee +
          transportFees +
          otherFees

        const agreedAmount = Number(transaction.agreed_amount) || 0
        const receivedAmount = Number(transaction.received_amount) || 0
        const remainingAmount = agreedAmount - receivedAmount

        const remainingDays = transaction.expiry_date
          ? Math.ceil(
              (new Date(transaction.expiry_date).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0

        let paymentStatus: string
        if (agreedAmount === 0) paymentStatus = "غير محدد"
        else if (remainingAmount <= 0) paymentStatus = "مدفوع بالكامل"
        else if (receivedAmount > 0 && remainingAmount > 0)
          paymentStatus = "مدفوع جزئياً"
        else paymentStatus = "غير مدفوع"

        worksheet.addRow({
          created_at: transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString("ar-SA")
            : "",
          resident_name: transaction.resident_name || "",
          iqama_number: transaction.iqama_number || "",
          nationality: transaction.nationality || "",
          profession: transaction.profession || "",
          phone_num: `${transaction.phone_num}` || "",
          service_type: transaction.service_type || "",
          expiry_date: transaction.expiry_date
            ? new Date(transaction.expiry_date).toLocaleDateString("ar-SA")
            : "",
          remaining_days: remainingDays,
          tashira_number: transaction.tashira_number || "",
          hodod_number: transaction.hodod_number || "",
          working: transaction.working || "",
          work_permit: workPermit,
          passports: passports,
          medical_insurance: medicalInsurance,
          medical_examination: medicalExamination,
          iqama: iqamaFee,
          tashira_fees: tashiraFee,
          transport_fees: transportFees,
          other_fees: otherFees,
          total: totalAmount,
          agreed_amount: agreedAmount,
          received_amount: receivedAmount,
          remaining: remainingAmount,
          payment_status: paymentStatus,
          payment_date: transaction.payment_date
            ? new Date(transaction.payment_date).toLocaleDateString("ar-SA")
            : "",
          unified_number_of_company:
            transaction.unified_number_of_company || "",
          establishment_number:
            transaction.companies?.establishment_number || "",
          social_insurance_number:
            transaction.companies?.social_insurance_number || "",
          Wresident_name: transaction.Wresident_name || "",
          Wiqama_number: transaction.Wiqama_number || "",
          Wphone_num: `${transaction.Wphone_num}` || "",
          memo_number: transaction.memo_number || "",
          note: transaction.note || "",
        })
      })

      // تنسيق باقي الخلايا (كما كان مع تحديث أرقام الأعمدة بسبب الإضافات)
      const dataRowCount = worksheet.rowCount
      for (let i = 2; i <= dataRowCount; i++) {
        const row = worksheet.getRow(i)
        row.height = 25
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        }
        row.font = { name: "Arial", size: 10 }

        if (i % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" },
          }
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E0E0E0" } },
            left: { style: "thin", color: { argb: "E0E0E0" } },
            bottom: { style: "thin", color: { argb: "E0E0E0" } },
            right: { style: "thin", color: { argb: "E0E0E0" } },
          }
        })

        // الأعمدة الرقمية (تحديث الأرقام حسب الترتيب الجديد)
        // الأعمدة: phone_num(6), work_permit(13), passports(14), medical_insurance(15), medical_examination(16), iqama(17), tashira_fees(18), transport_fees(19), other_fees(20), total(21), agreed_amount(22), received_amount(23), remaining(24), Wphone_num(28)
        const numberColumns = [
          6, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28,
        ]
        numberColumns.forEach((colIndex) => {
          const cell = row.getCell(colIndex)
          if (
            cell.value !== null &&
            cell.value !== undefined &&
            cell.value !== ""
          ) {
            const numValue = Number(cell.value)
            if (!isNaN(numValue)) {
              cell.numFmt = "#,##0"
              cell.value = numValue
            }
          }
        })

        // تلوين عمود الإجمالي (العمود 21)
        const totalCell = row.getCell(21)
        if (totalCell.value && typeof totalCell.value === "number") {
          totalCell.font = { bold: true, size: 11, color: { argb: "E65100" } }
          totalCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3E0" },
          }
        }

        // تلوين عمود المتبقي (العمود 24)
        const remainingCell = row.getCell(24)
        if (remainingCell.value && typeof remainingCell.value === "number") {
          if (remainingCell.value > 0) {
            remainingCell.font = { color: { argb: "C62828" }, bold: true }
            remainingCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEBEE" },
            }
          } else {
            remainingCell.font = { color: { argb: "2E7D32" }, bold: true }
            remainingCell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "E8F5E9" },
            }
          }
        }

        // تلوين حالة الدفع (العمود 25)
        const paymentStatusCell = row.getCell(25)
        const statusValue = paymentStatusCell.value?.toString() || ""
        if (statusValue === "مدفوع بالكامل") {
          paymentStatusCell.font = { color: { argb: "2E7D32" }, bold: true }
          paymentStatusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E8F5E9" },
          }
        } else if (statusValue === "مدفوع جزئياً") {
          paymentStatusCell.font = { color: { argb: "E65100" }, bold: true }
          paymentStatusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3E0" },
          }
        } else if (statusValue === "غير مدفوع") {
          paymentStatusCell.font = { color: { argb: "C62828" }, bold: true }
          paymentStatusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFEBEE" },
          }
        }
      }

      worksheet.views = [{ rightToLeft: true, state: "frozen", ySplit: 1 }]

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const fileName = `المعاملات_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.xlsx`
      saveAs(blob, fileName)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("حدث خطأ أثناء تصدير البيانات")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {isExporting ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          جاري التصدير...
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          تصدير إلى Excel
        </>
      )}
    </button>
  )
}
