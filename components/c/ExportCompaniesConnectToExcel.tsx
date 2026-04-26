// components/ExportCompaniesToExcel.tsx
"use client"

import { useState } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

type Company = {
  id?: string
  com1: number
  com2: number
  created_at?: string
}

export default function ExportCompaniesToExcel() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchCompanies = async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("conectCompanies")
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

      const worksheet = workbook.addWorksheet("الشركات المتصلة", {
        properties: { tabColor: { argb: "1B5E20" } },
        views: [{ state: "frozen", ySplit: 1 }],
      })

      const columns = [
        { header: "م", key: "index", width: 8, group: 1 },
        { header: "الشركة الأولى (ربط)", key: "com1", width: 25, group: 2 },
        { header: "الشركة الثانية (معا)", key: "com2", width: 25, group: 3 },
        { header: "تاريخ الإضافة", key: "created_at", width: 20, group: 4 },
      ]

      worksheet.columns = columns

      // تنسيق رأس الجدول
      const headerRow = worksheet.getRow(1)
      headerRow.height = 35
      headerRow.font = {
        name: "Arial",
        size: 13,
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

      const groupColors: { [key: number]: string } = {
        1: "37474F",
        2: "0D47A1",
        3: "B71C1C",
        4: "1B5E20",
      }

      columns.forEach((col: any, index: number) => {
        const cell = headerRow.getCell(index + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: groupColors[col.group] },
        }
      })

      // دالة لتحويل التاريخ إلى صيغة عربية مقروءة
      const formatDateArabic = (dateString: string): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString // إذا كان التاريخ غير صالح نرجعه كما هو

        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
        return date.toLocaleDateString("ar-SA", options)
      }

      // إضافة البيانات
      companies.forEach((company: Company, index: number) => {
        const row = worksheet.addRow({
          index: index + 1,
          com1: company.com1 || 0,
          com2: company.com2 || 0,
          created_at: formatDateArabic(company.created_at || ""),
        })

        const indexCell = row.getCell(1)
        indexCell.alignment = { horizontal: "center", vertical: "middle" }
        indexCell.font = { bold: true, size: 11, color: { argb: "37474F" } }
      })

      const dataRowCount = worksheet.rowCount

      for (let i = 2; i <= dataRowCount; i++) {
        const row = worksheet.getRow(i)
        row.height = 30
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        }
        row.font = {
          name: "Arial",
          size: 12,
        }

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
          cell.border = {
            top: { style: "thin", color: { argb: "E0E0E0" } },
            left: { style: "thin", color: { argb: "E0E0E0" } },
            bottom: { style: "thin", color: { argb: "E0E0E0" } },
            right: { style: "thin", color: { argb: "E0E0E0" } },
          }

          // أعمدة أرقام الشركات - بدون فواصل
          if (colNumber === 2 || colNumber === 3) {
            const numValue = Number(cell.value)
            if (!isNaN(numValue)) {
              cell.value = numValue
              // تمت إزالة numFmt لإلغاء الفواصل
              cell.font = {
                name: "Arial",
                size: 12,
                bold: true,
              }
              if (colNumber === 2) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "E3F2FD" },
                }
                cell.font = { ...cell.font, color: { argb: "0D47A1" } }
              } else if (colNumber === 3) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFEBEE" },
                }
                cell.font = { ...cell.font, color: { argb: "B71C1C" } }
              }
            }
          }

          // تنسيق عمود التاريخ
          if (colNumber === 4) {
            cell.font = {
              name: "Arial",
              size: 11,
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

      const fileName = `الشركات_المرتبطة_${new Date()
        .toLocaleDateString("ar-SA")
        .replace(/\//g, "-")}.xlsx`
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
