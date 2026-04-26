// components/ExportToExcel.tsx
"use client"

import { useState } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

// تعريف النوع مباشرة في المكون
type Transaction = {
  id: string
  resident_name: string
  iqama_number: string
  nationality: string
  profession: string
  expiry_date: string | null
  payment_date: string | null
  unified_number_of_company: string
  companies: {
    establishment_number: string
    social_insurance_number: string
  } | null
  memo_number: string | null
  service_type: string
  work_permit: number
  passports: number
  phone_num: number
  medical_insurance: number
  transport_fees: number
  other_fees: number
  agreed_amount: number
  received_amount: number
  note: string
  created_at: string
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
      // جلب البيانات فقط عند الضغط على الزر
      const transactions = await fetchTransactions()

      if (!transactions || transactions.length === 0) {
        alert("لا توجد بيانات للتصدير")
        setIsExporting(false)
        return
      }

      // إنشاء Workbook جديد
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "نظام المعاملات"
      workbook.created = new Date()

      // إضافة ورقة عمل
      const worksheet = workbook.addWorksheet("المعاملات", {
        properties: { tabColor: { argb: "2E86C1" } },
        views: [{ state: "frozen", ySplit: 1 }],
      })

      // تعريف الأعمدة
      const columns = [
        // المجموعة الأولى: معلومات أساسية (أزرق فاتح)
        { header: "تاريخ العملية", key: "created_at", width: 15, group: 1 },
        { header: "اسم المقيم", key: "resident_name", width: 25, group: 1 },
        { header: "رقم الإقامة", key: "iqama_number", width: 15, group: 1 },
        { header: "الجنسية", key: "nationality", width: 12, group: 1 },
        { header: "المهنة", key: "profession", width: 20, group: 1 },
        { header: "رقم الجوال", key: "phone_num", width: 12, group: 1 },

        // المجموعة الثانية: تفاصيل الخدمة والإقامة (أخضر فاتح)
        { header: "نوع الخدمة", key: "service_type", width: 15, group: 2 },
        { header: "انتهاء الإقامة", key: "expiry_date", width: 15, group: 2 },
        {
          header: "المتبقي (أيام)",
          key: "remaining_days",
          width: 12,
          group: 2,
        },

        // المجموعة الثالثة: الرسوم (برتقالي/أصفر)
        { header: "رخصة عمل", key: "work_permit", width: 12, group: 3 },
        { header: "جوازات", key: "passports", width: 10, group: 3 },
        { header: "تأمين طبي", key: "medical_insurance", width: 12, group: 3 },
        { header: "نقل", key: "transport_fees", width: 10, group: 3 },
        { header: "أخرى", key: "other_fees", width: 10, group: 3 },
        { header: "الإجمالي", key: "total", width: 12, group: 3 },

        // المجموعة الرابعة: المدفوعات (أرجواني)
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

        // المجموعة الخامسة: معلومات الشركة (رمادي/أزرق غامق)
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

        // المجموعة السادسة: ملاحظات (رمادي فاتح)
        { header: "مذكرة", key: "memo_number", width: 15, group: 6 },
        { header: "ملاحظة", key: "note", width: 30, group: 6 },
      ]

      // تعيين الأعمدة
      worksheet.columns = columns

      // تنسيق رأس الجدول
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

      // تلوين رؤوس الأعمدة حسب المجموعات
      const groupColors: { [key: number]: string } = {
        1: "2196F3", // أزرق - معلومات أساسية
        2: "4CAF50", // أخضر - تفاصيل الخدمة
        3: "FF9800", // برتقالي - الرسوم
        4: "9C27B0", // أرجواني - المدفوعات
        5: "607D8B", // رمادي مزرق - معلومات الشركة
        6: "757575", // رمادي - ملاحظات
      }

      columns.forEach((col: any, index: number) => {
        const cell = headerRow.getCell(index + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: groupColors[col.group] },
        }
      })

      // إضافة البيانات مع العمليات الحسابية الصحيحة
      transactions.forEach((transaction: Transaction) => {
        // 🔧 الإجمالي = مجموع كل الرسوم (أعمدة J إلى N)
        // J: work_permit, K: passports, L: medical_insurance, M: transport_fees, N: other_fees
        const workPermit = Number(transaction.work_permit) || 0
        const passports = Number(transaction.passports) || 0
        const medicalInsurance = Number(transaction.medical_insurance) || 0
        const transportFees = Number(transaction.transport_fees) || 0
        const otherFees = Number(transaction.other_fees) || 0

        const totalAmount =
          workPermit + passports + medicalInsurance + transportFees + otherFees

        // 🔧 المتبقي = المتفق عليه - المستلم (عمود P - عمود Q)
        const agreedAmount = Number(transaction.agreed_amount) || 0
        const receivedAmount = Number(transaction.received_amount) || 0

        const remainingAmount = agreedAmount - receivedAmount

        // حساب الأيام المتبقية في الإقامة
        const remainingDays = transaction.expiry_date
          ? Math.ceil(
              (new Date(transaction.expiry_date).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0

        // تحديد حالة الدفع
        let paymentStatus: string
        if (agreedAmount === 0) {
          paymentStatus = "غير محدد"
        } else if (remainingAmount <= 0) {
          paymentStatus = "مدفوع بالكامل"
        } else if (receivedAmount > 0 && remainingAmount > 0) {
          paymentStatus = "مدفوع جزئياً"
        } else {
          paymentStatus = "غير مدفوع"
        }

        // إضافة الصف
        worksheet.addRow({
          created_at: transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString("ar-SA")
            : "",
          resident_name: transaction.resident_name || "",
          iqama_number: transaction.iqama_number || "",
          nationality: transaction.nationality || "",
          profession: transaction.profession || "",
          phone_num: transaction.phone_num || 0,
          service_type: transaction.service_type || "",
          expiry_date: transaction.expiry_date
            ? new Date(transaction.expiry_date).toLocaleDateString("ar-SA")
            : "",
          remaining_days: remainingDays,
          work_permit: workPermit,
          passports: passports,
          medical_insurance: medicalInsurance,
          transport_fees: transportFees,
          other_fees: otherFees,
          total: totalAmount, // ✅ هذا عمود O
          agreed_amount: agreedAmount, // هذا عمود P
          received_amount: receivedAmount, // هذا عمود Q
          remaining: remainingAmount, // ✅ هذا عمود R = P - Q
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
          memo_number: transaction.memo_number || "",
          note: transaction.note || "",
        })
      })

      // تنسيق خلايا البيانات
      const dataRowCount = worksheet.rowCount

      for (let i = 2; i <= dataRowCount; i++) {
        const row = worksheet.getRow(i)
        row.height = 25
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        }
        row.font = {
          name: "Arial",
          size: 10,
        }

        // تلوين خلفية الصفوف بالتناوب
        if (i % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" },
          }
        }

        // إضافة حدود للخلايا
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "E0E0E0" } },
            left: { style: "thin", color: { argb: "E0E0E0" } },
            bottom: { style: "thin", color: { argb: "E0E0E0" } },
            right: { style: "thin", color: { argb: "E0E0E0" } },
          }
        })

        // تنسيق الأعمدة الرقمية - ملاحظة: تم تعديل أرقام الأعمدة
        // عمود J=10, K=11, L=12, M=13, N=14, O=15 (الإجمالي)
        // عمود P=16, Q=17, R=18 (المتبقي)
        const numberColumns = [6, 10, 11, 12, 13, 14, 15, 16, 17, 18]
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
              // تحويل القيمة إلى رقم فعلي
              cell.value = numValue
            }
          }
        })

        // تلوين عمود الإجمالي (O = 15)
        const totalCell = row.getCell(15)
        if (totalCell.value && typeof totalCell.value === "number") {
          totalCell.font = { bold: true, size: 11, color: { argb: "E65100" } }
          totalCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3E0" },
          }
        }

        // تلوين عمود المتبقي (R = 18)
        const remainingCell = row.getCell(18)
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

        // تلوين حالة الدفع (عمود S = 19)
        const paymentStatusCell = row.getCell(19)
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

      // ضبط اتجاه الورقة من اليمين لليسار للعربية
      worksheet.views = [
        {
          rightToLeft: true,
          state: "frozen",
          ySplit: 1,
        },
      ]

      // إنشاء وحفظ الملف
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
