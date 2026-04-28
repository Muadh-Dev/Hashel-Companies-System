// components/ExportCompaniesFullToExcel.tsx
"use client"

import { useState } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

type Company = {
  id: string
  unified_number: string
  establishment_number: string
  social_insurance_number: string
  company_owner: string
  entity_type: string
  crNumber: number
  cr_expiry_date: string | null
  government_fees: number
  commercial_register_fees: number
  qiwa: number
  muqeem: number
  total_costs: number
  transfers_count: number
  visas_count: number
  exemption_amount: number
  newspaper_price: number
  created_at: string
  employees_count: number
}

export default function ExportCompaniesFullToExcel() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchCompanies = async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("خطأ في جلب بيانات الشركات:", error)
      throw new Error("فشل في جلب البيانات من قاعدة البيانات")
    }

    return data || []
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const companies = await fetchCompanies()

      if (!companies || companies.length === 0) {
        alert("لا توجد بيانات للتصدير")
        setIsExporting(false)
        return
      }

      const workbook = new ExcelJS.Workbook()
      workbook.creator = "نظام إدارة الشركات"
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet("الشركات", {
        properties: { tabColor: { argb: "1565C0" } },
        views: [{ state: "frozen", ySplit: 1 }],
      })

      // تعريف الأعمدة مع مفاتيحها ومجموعاتها
      const columns = [
        { header: "م", key: "index", width: 8, group: 1 },
        {
          header: "رقم الشركة الموحد",
          key: "unified_number",
          width: 20,
          group: 1,
        },
        {
          header: "رقم المنشأة",
          key: "establishment_number",
          width: 20,
          group: 1,
        },
        {
          header: "رقم التأمينات",
          key: "social_insurance_number",
          width: 20,
          group: 1,
        },
        { header: "مالك الشركة", key: "company_owner", width: 25, group: 1 },
        { header: "نوع الكيان", key: "entity_type", width: 15, group: 1 },
        { header: "رقم السجل التجاري", key: "crNumber", width: 18, group: 1 },
        {
          header: "تاريخ انتهاء السجل",
          key: "cr_expiry_date",
          width: 18,
          group: 1,
        },
        { header: "رسوم حكومية", key: "government_fees", width: 15, group: 2 },
        {
          header: "رسوم السجل التجاري",
          key: "commercial_register_fees",
          width: 18,
          group: 2,
        },
        { header: "قوى", key: "qiwa", width: 12, group: 2 },
        { header: "مقيم", key: "muqeem", width: 12, group: 2 },
        { header: "إجمالي التكاليف", key: "total_costs", width: 15, group: 2 },
        {
          header: "عدد التحويلات",
          key: "transfers_count",
          width: 15,
          group: 3,
        },
        { header: "عدد التأشيرات", key: "visas_count", width: 15, group: 3 },
        {
          header: "مبلغ الإعفاء",
          key: "exemption_amount",
          width: 15,
          group: 4,
        },
        { header: "سعر الجريدة", key: "newspaper_price", width: 15, group: 4 },
        { header: "تاريخ الإضافة", key: "created_at", width: 20, group: 5 },
        { header: "عدد الموظفين", key: "employees_count", width: 15, group: 6 },
      ]

      worksheet.columns = columns

      // تنسيق رأس الجدول
      const headerRow = worksheet.getRow(1)
      headerRow.height = 35
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
        bottom: { style: "medium", color: { argb: "333333" } },
        right: { style: "thin", color: { argb: "CCCCCC" } },
      }

      // ألوان المجموعات
      const groupColors: { [key: number]: string } = {
        1: "1565C0", // أزرق - معلومات أساسية
        2: "00838F", // تيل - رسوم وتكاليف
        3: "6A1B9A", // بنفسجي - تحويلات وتأشيرات
        4: "C62828", // أحمر - إعفاء وجريدة
        5: "2E7D32", // أخضر - تاريخ الإضافة
        6: "37474F", // رمادي غامق - موظفين
      }

      columns.forEach((col: any, index: number) => {
        const cell = headerRow.getCell(index + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: groupColors[col.group] },
        }
      })

      // دالة لتنسيق التاريخ عربي
      const formatDateArabic = (dateString: string | null): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      // إضافة البيانات
      companies.forEach((company: Company, index: number) => {
        const row = worksheet.addRow({
          index: index + 1,
          unified_number: company.unified_number || "",
          establishment_number: company.establishment_number || "",
          social_insurance_number: company.social_insurance_number || "",
          company_owner: company.company_owner || "",
          entity_type: company.entity_type || "",
          crNumber: company.crNumber || 0,
          cr_expiry_date: formatDateArabic(company.cr_expiry_date),
          government_fees: company.government_fees || 0,
          commercial_register_fees: company.commercial_register_fees || 0,
          qiwa: company.qiwa || 0,
          muqeem: company.muqeem || 0,
          total_costs: company.total_costs || 0,
          transfers_count: company.transfers_count || 0,
          visas_count: company.visas_count || 0,
          exemption_amount: company.exemption_amount || 0,
          newspaper_price: company.newspaper_price || 0,
          created_at: formatDateArabic(company.created_at),
          employees_count: company.employees_count || 0,
        })

        // تنسيق رقم الصف
        const indexCell = row.getCell(1)
        indexCell.alignment = { horizontal: "center", vertical: "middle" }
        indexCell.font = { bold: true, size: 11, color: { argb: "37474F" } }
      })

      const dataRowCount = worksheet.rowCount

      // تنسيق صفوف البيانات
      for (let i = 2; i <= dataRowCount; i++) {
        const row = worksheet.getRow(i)
        row.height = 28
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        }
        row.font = {
          name: "Arial",
          size: 10,
        }

        // تلوين الصفوف بالتناوب
        if (i % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" },
          }
        } else {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          }
        }

        row.eachCell((cell, colNumber) => {
          // حدود الخلية
          cell.border = {
            top: { style: "thin", color: { argb: "E0E0E0" } },
            left: { style: "thin", color: { argb: "E0E0E0" } },
            bottom: { style: "thin", color: { argb: "E0E0E0" } },
            right: { style: "thin", color: { argb: "E0E0E0" } },
          }

          // تحديد الأعمدة الرقمية (بدون فواصل)
          const numericColumns = [
            7, // crNumber
            9, // government_fees
            10, // commercial_register_fees
            11, // qiwa
            12, // muqeem
            13, // total_costs
            14, // transfers_count
            15, // visas_count
            16, // exemption_amount
            17, // newspaper_price
            19, // employees_count
          ]

          if (numericColumns.includes(colNumber)) {
            const numValue = Number(cell.value)
            if (!isNaN(numValue)) {
              cell.value = numValue
              // بدون numFmt لإزالة الفواصل
              cell.font = {
                name: "Arial",
                size: 10,
                bold: true,
              }
              // إبراز بعض الأعمدة الهامة بلون خلفية خفيف
              if (colNumber === 13) {
                // إجمالي التكاليف
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "E0F2F1" },
                }
                cell.font = { ...cell.font, color: { argb: "00695C" } }
              } else if (colNumber === 16) {
                // مبلغ الإعفاء
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFEBEE" },
                }
                cell.font = { ...cell.font, color: { argb: "B71C1C" } }
              }
            }
          }

          // تنسيق أعمدة التاريخ
          if (colNumber === 8 || colNumber === 18) {
            // cr_expiry_date, created_at
            cell.font = {
              name: "Arial",
              size: 10,
              color: { argb: "1B5E20" },
            }
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "E8F5E9" },
            }
          }
        })
      }

      worksheet.views = [
        {
          rightToLeft: true,
          state: "frozen",
          ySplit: 1,
        },
      ]

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const fileName = `الشركات_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.xlsx`
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
