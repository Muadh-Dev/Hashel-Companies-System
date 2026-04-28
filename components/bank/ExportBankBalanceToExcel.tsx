// components/ExportBankBalanceToExcel.tsx
"use client"

import { useState } from "react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { supabase } from "@/lib/supabase/supabaseSsrClient"

type BankTransaction = {
  id?: string
  operation_date: string
  operation: string
  description: string
  debit: number
  credit: number
  created_at?: string
}

export default function ExportBankBalanceToExcel() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchTransactions = async (): Promise<BankTransaction[]> => {
    const { data, error } = await supabase
      .from("bank_balance")
      .select("*")
      .order("operation_date", { ascending: false })

    if (error) {
      console.error("خطأ في جلب العمليات البنكية:", error)
      throw new Error("فشل في جلب البيانات")
    }

    return data || []
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const transactions = await fetchTransactions()

      if (!transactions || transactions.length === 0) {
        alert("لا توجد عمليات بنكية للتصدير")
        setIsExporting(false)
        return
      }

      const workbook = new ExcelJS.Workbook()
      workbook.creator = "النظام البنكي"
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet("العمليات البنكية", {
        properties: { tabColor: { argb: "0D47A1" } },
        views: [{ state: "frozen", ySplit: 1 }],
      })

      // تعريف الأعمدة
      const columns = [
        { header: "م", key: "index", width: 8, group: 1 },
        { header: "تاريخ العملية", key: "operation_date", width: 20, group: 1 },
        { header: "العملية", key: "operation", width: 25, group: 1 },
        { header: "الوصف", key: "description", width: 35, group: 2 },
        { header: "مدين", key: "debit", width: 18, group: 3 },
        { header: "دائن", key: "credit", width: 18, group: 3 },
      ]

      worksheet.columns = columns

      // تنسيق رأس الجدول
      const headerRow = worksheet.getRow(1)
      headerRow.height = 35
      headerRow.font = {
        name: "Arial",
        size: 12,
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
        1: "1565C0", // أزرق
        2: "00695C", // تيل للوصف
        3: "B71C1C", // أحمر للمبالغ
      }

      columns.forEach((col: any, index: number) => {
        const cell = headerRow.getCell(index + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: groupColors[col.group] },
        }
      })

      // دالة تنسيق التاريخ عربي
      const formatDateArabic = (dateString: string): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      let totalDebit = 0
      let totalCredit = 0

      // إضافة البيانات وحساب الإجماليات
      transactions.forEach((t: BankTransaction, index: number) => {
        const debit = Number(t.debit) || 0
        const credit = Number(t.credit) || 0
        totalDebit += debit
        totalCredit += credit

        worksheet.addRow({
          index: index + 1,
          operation_date: formatDateArabic(t.operation_date),
          operation: t.operation || "",
          description: t.description || "",
          debit: debit,
          credit: credit,
        })
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
          size: 11,
        }

        // صفوف متناوبة
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

          // تنسيق الأعمدة الرقمية (E=5, F=6)
          if (colNumber === 5 || colNumber === 6) {
            const numValue = Number(cell.value)
            if (!isNaN(numValue)) {
              cell.value = numValue
              cell.font = {
                name: "Arial",
                size: 11,
                bold: true,
              }
              if (colNumber === 5) {
                // مدين
                cell.font = { ...cell.font, color: { argb: "C62828" } }
              } else {
                // دائن
                cell.font = { ...cell.font, color: { argb: "2E7D32" } }
              }
            }
          }

          // تنسيق عمود تاريخ العملية
          if (colNumber === 2) {
            cell.font = {
              name: "Arial",
              size: 11,
              color: { argb: "0D47A1" },
            }
          }
        })
      }

      // إضافة صفوف الإجماليات
      const netAmount = totalCredit - totalDebit

      // سطر فارغ للفصل
      worksheet.addRow({})

      // إجمالي مدين
      const debitTotalRow = worksheet.addRow({
        index: "",
        operation_date: "",
        operation: "",
        description: "إجمالي المدين",
        debit: totalDebit,
        credit: "",
      })

      // إجمالي دائن
      const creditTotalRow = worksheet.addRow({
        index: "",
        operation_date: "",
        operation: "",
        description: "إجمالي الدائن",
        debit: "",
        credit: totalCredit,
      })

      // الصافي
      const netRow = worksheet.addRow({
        index: "",
        operation_date: "",
        operation: "",
        description: "الصافي",
        debit: "", // سنضعه حسب الإشارة لاحقاً
        credit: "", // سنضعه حسب الإشارة
      })

      // تنسيق صفوف الإجماليات
      const formatTotalRow = (row: ExcelJS.Row, desc: string) => {
        row.height = 30
        row.font = {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: "212121" },
        }
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E0E0E0" },
        }
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "medium", color: { argb: "333333" } },
            left: { style: "thin", color: { argb: "999999" } },
            bottom: { style: "medium", color: { argb: "333333" } },
            right: { style: "thin", color: { argb: "999999" } },
          }
          cell.alignment = { horizontal: "center", vertical: "middle" }
          if (colNumber === 5 || colNumber === 6) {
            cell.numFmt = "#,##0" // لا نريد فواصل، لكن سنزيلها لاحقاً
            cell.font = { ...cell.font, bold: true }
          }
        })
      }

      formatTotalRow(debitTotalRow, "إجمالي المدين")
      formatTotalRow(creditTotalRow, "إجمالي الدائن")
      formatTotalRow(netRow, "الصافي")

      // ضبط قيمة الصافي في العمود المناسب
      const netCell = netRow.getCell(5) // عمود مدين
      const netCellCredit = netRow.getCell(6) // عمود دائن

      if (netAmount >= 0) {
        // الصافي موجب => نضعه في دائن
        netCellCredit.value = netAmount
        netCellCredit.font = {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: "2E7D32" },
        }
      } else {
        // الصافي سالب => نضعه في مدين كقيمة موجبة
        netCell.value = Math.abs(netAmount)
        netCell.font = {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: "C62828" },
        }
      }

      // إزالة الفواصل من كل الأرقام في الإجماليات (override numFmt)
      debitTotalRow.getCell(5).numFmt = "0"
      creditTotalRow.getCell(6).numFmt = "0"
      if (netAmount >= 0) {
        netRow.getCell(6).numFmt = "0"
      } else {
        netRow.getCell(5).numFmt = "0"
      }

      // عرض RTL وتجميد
      worksheet.views = [
        {
          rightToLeft: true,
          state: "frozen",
          ySplit: 1,
        },
      ]

      // إنشاء الملف
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const fileName = `العمليات_البنكية_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.xlsx`
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
