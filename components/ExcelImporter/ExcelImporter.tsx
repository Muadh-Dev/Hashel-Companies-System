"use client"

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react"
import ExcelJS from "exceljs"
import {
  TargetColumn,
  ExcelImporterProps,
  SheetData,
  ColumnMapping,
  ImportProgress,
} from "./types"
import { toast } from "sonner"

// ─────────────────────────────────────────────────────────────
// مطابقة ذكية
// ─────────────────────────────────────────────────────────────
const normalize = (s: string) =>
  s
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim()

const fuzzyMatch = (
  header: string,
  targetColumns: TargetColumn[]
): { key: string; matched: boolean } => {
  const h = normalize(header)
  if (!h) return { key: "ignore", matched: false }

  // 1. المطابقة التامة (Exact Match) - الأولوية القصوى
  let col = targetColumns.find((tc) => normalize(tc.label) === h)
  if (col) return { key: col.key, matched: true }

  // 2. مطابقة الاحتواء (Inclusion) - للمصطلحات الطويلة
  col = targetColumns.find((tc) => {
    const t = normalize(tc.label)
    // نتأكد أن طول النص كافٍ لتجنب المطابقات العشوائية
    return h.length > 2 && t.length > 2 && (h.includes(t) || t.includes(h))
  })
  if (col) return { key: col.key, matched: true }

  // 3. مطابقة الكلمات (Word-based Matching)
  // تحسين: استخراج الكلمات التي طولها أكثر من حرف واحد لتجنب "و" أو حروف الجر
  const hWords = h.match(/\p{L}{2,}/gu) ?? []

  if (hWords.length > 0) {
    col = targetColumns.find((tc) => {
      const tWords: string[] = normalize(tc.label).match(/\p{L}+/gu) ?? []
      if (tWords.length === 0) return false

      // حساب الكلمات المشتركة بوضوح
      const commonWords = hWords.filter((word) => tWords.includes(word))

      // شرط المطابقة: يجب أن تتطابق نصف الكلمات على الأقل
      const minRequired = Math.ceil(Math.min(hWords.length, tWords.length) / 2)
      return commonWords.length >= minRequired
    })

    if (col) return { key: col.key, matched: true }
  }

  return { key: "ignore", matched: false }
}

// بعد المطابقة: أول ظهور لكل key يكسب، الباقي → ignore
const deduplicateMappings = (mappings: ColumnMapping[]): ColumnMapping[] => {
  const seen = new Set<string>()
  return mappings.map((m) => {
    if (m.targetKey === "ignore") return m
    if (seen.has(m.targetKey))
      return { ...m, targetKey: "ignore", autoMatched: false }
    seen.add(m.targetKey)
    return m
  })
}

// ─────────────────────────────────────────────────────────────
// LocalStorage
// ─────────────────────────────────────────────────────────────
const djb2 = (str: string) => {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i)
  return (h >>> 0).toString(36)
}

const storageKey = (sheetName: string, headers: any[]) =>
  `xl-map::${sheetName}::${djb2(headers.map((h) => h?.toString() ?? "").join("|"))}`

const saveMappings = (
  name: string,
  headers: any[],
  mappings: ColumnMapping[]
) => {
  try {
    localStorage.setItem(storageKey(name, headers), JSON.stringify(mappings))
  } catch {}
}

const loadMappings = (name: string, headers: any[]): ColumnMapping[] | null => {
  try {
    const raw = localStorage.getItem(storageKey(name, headers))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────
const ProgressBar = ({ progress }: { progress: ImportProgress }) => {
  const pct =
    progress.total === 0
      ? 0
      : Math.round((progress.done / progress.total) * 100)
  return (
    <div className="space-y-1.5 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <div className="flex items-center justify-between text-xs font-bold text-blue-700">
        <span className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          جاري الاستيراد...
        </span>
        <span>
          {progress.done.toLocaleString("ar-SA")} /{" "}
          {progress.total.toLocaleString("ar-SA")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-200">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" />
      </div>
      <p className="text-right text-[11px] text-blue-500">{pct}% مكتمل</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// رأس العمود
// ─────────────────────────────────────────────────────────────
interface MappingHeaderProps {
  idx: number
  mapping: ColumnMapping
  targetColumns: TargetColumn[]
  excelColName: string
  isDuplicate: boolean
  onChange: (idx: number, newTarget: string) => void
}

const MappingHeader = ({
  idx,
  mapping,
  targetColumns,
  excelColName,
  isDuplicate,
  onChange,
}: MappingHeaderProps) => {
  const isIgnored = mapping.targetKey === "ignore"
  const isRequired =
    !isIgnored &&
    targetColumns.find((c) => c.key === mapping.targetKey)?.required

  let cardClass: string
  if (isDuplicate) {
    cardClass = "border-red-300 bg-red-50"
  } else if (isIgnored) {
    cardClass = "border-slate-200 bg-slate-50"
  } else if (mapping.autoMatched) {
    cardClass = "border-emerald-200 bg-emerald-50"
  } else {
    cardClass = "border-blue-200 bg-blue-50"
  }

  return (
    <th className="min-w-[190px] border-x border-slate-100 p-2 align-top">
      <div className={`rounded-lg border p-2 transition-colors ${cardClass}`}>
        <select
          value={mapping.targetKey}
          onChange={(e) => onChange(idx, e.target.value)}
          className={`w-full cursor-pointer bg-transparent text-xs font-bold focus:outline-none ${
            isIgnored
              ? "text-slate-400"
              : isDuplicate
                ? "text-red-700"
                : "text-slate-700"
          }`}
        >
          <option value="ignore">تجاهل ✖</option>
          <optgroup label="أعمدة قاعدة البيانات">
            {targetColumns.map((tc) => (
              <option key={tc.key} value={tc.key}>
                {tc.label}
                {tc.required ? " *" : ""}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
          {isDuplicate ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
              ⚠ مكرر
            </span>
          ) : !isIgnored ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                mapping.autoMatched
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {mapping.autoMatched ? "✓ تلقائي" : "✎ يدوي"}
            </span>
          ) : null}
          {isRequired && !isDuplicate && (
            <span className="text-[9px] font-bold text-amber-600">إلزامي</span>
          )}
        </div>
      </div>

      <div
        className="mt-1.5 truncate rounded bg-slate-100 px-2 py-1 text-[11px]"
        title={excelColName}
      >
        <span className="text-slate-400">xlsx: </span>
        <span className="font-semibold text-slate-700">
          {excelColName || "—"}
        </span>
      </div>
    </th>
  )
}

// ─────────────────────────────────────────────────────────────
// شريط الملخص
// ─────────────────────────────────────────────────────────────
const MappingSummary = ({
  mappings,
  targetColumns,
  duplicateKeys,
}: {
  mappings: ColumnMapping[]
  targetColumns: TargetColumn[]
  duplicateKeys: Set<string>
}) => {
  const mapped = mappings.filter(
    (m) => m.targetKey !== "ignore" && !duplicateKeys.has(m.targetKey)
  )
  const autoCount = mapped.filter((m) => m.autoMatched).length
  const ignoredCount = mappings.filter((m) => m.targetKey === "ignore").length
  const requiredMissing = targetColumns
    .filter((tc) => tc.required)
    .filter(
      (tc) =>
        !mappings.some(
          (m) => m.targetKey === tc.key && !duplicateKeys.has(tc.key)
        )
    )

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        {autoCount} تلقائي
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
        {mapped.length - autoCount} يدوي
      </span>
      {ignoredCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
          {ignoredCount} متجاهَل
        </span>
      )}
      {duplicateKeys.size > 0 && (
        <span className="flex items-center gap-1 font-bold text-red-600">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          {duplicateKeys.size} حقل مكرر — الأول يُحفظ فقط
        </span>
      )}
      {requiredMissing.length > 0 && (
        <span className="flex items-center gap-1 font-bold text-amber-600">
          ⚠ {requiredMissing.map((c) => c.label).join("، ")} غير معيَّن
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────────────────────
export default function ExcelImporter({
  targetColumns,
  onImport,
  buttonLabel = "استيراد البيانات",
  maxRows = Infinity,
  presetFields = {},
}: ExcelImporterProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [importCount, setImportCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  // بعد نجاح الاستيراد: نُبقي الملف ونظهر banner مؤقت
  const [lastImport, setLastImport] = useState<{
    count: number
    sheetName: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const skipSave = useRef(false)

  const currentSheet = sheets[activeSheetIndex]

  const [previewLimit, setPreviewLimit] = useState(100)
  const [rowOffset, setRowOffset] = useState(0) // بداية الاستيراد (0 = من أول صف)

  // ── حفظ تلقائي ──────────────────────────────────────────
  useEffect(() => {
    if (!currentSheet || mappings.length === 0 || skipSave.current) return
    saveMappings(currentSheet.name, currentSheet.data[0] ?? [], mappings)
  }, [mappings]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── حساب الأعمدة المكررة ─────────────────────────────────
  const duplicateKeys = useMemo<Set<string>>(() => {
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const m of mappings) {
      if (m.targetKey === "ignore") continue
      if (seen.has(m.targetKey)) dupes.add(m.targetKey)
      else seen.add(m.targetKey)
    }
    return dupes
  }, [mappings])

  // ── تهيئة خريطة الأعمدة ─────────────────────────────────
  const initializeMappings = useCallback(
    (sheet: SheetData) => {
      const headerRow = sheet.data[0] ?? []

      const saved = loadMappings(sheet.name, headerRow)
      if (saved && saved.length === headerRow.length) {
        skipSave.current = true
        setMappings(saved)
        requestAnimationFrame(() => {
          skipSave.current = false
        })
        return
      }

      const initial = deduplicateMappings(
        headerRow.map((h: any, i: number) => {
          const { key, matched } = fuzzyMatch(
            h?.toString() ?? "",
            targetColumns
          )
          return { excelColIndex: i, targetKey: key, autoMatched: matched }
        })
      )

      skipSave.current = true
      setMappings(initial)
      requestAnimationFrame(() => {
        skipSave.current = false
      })
    },
    [targetColumns]
  )

  // ── قراءة الملف ─────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsReadingFile(true)
    setLastImport(null)

    setTimeout(async () => {
      try {
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(await file.arrayBuffer())

        const allSheets: SheetData[] = []
        workbook.worksheets.forEach((ws) => {
          const rows: any[][] = []
          let colCount = 0

          let emptyStreak = 0
          ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (emptyStreak > 20) return // توقف بعد 20 صف فارغ متتالي
            const raw = Array.isArray(row.values) ? row.values.slice(1) : []
            if (rowNumber === 1) colCount = raw.length

            const normalized = Array.from({ length: colCount }, (_, i) => {
              let val = raw[i]
              if (val && typeof val === "object") {
                if ("result" in val) val = val.result
                else if ("richText" in val)
                  val = val.richText.map((t: any) => t.text).join("")
                else if ("text" in val) val = val.text
              }
              return val ?? ""
            })

            if (normalized.every((c) => c === "" || c === null)) {
              emptyStreak++
              return
            }
            emptyStreak = 0
            rows.push(normalized)
          })

          if (rows.length > 0) allSheets.push({ name: ws.name, data: rows })
        })

        if (allSheets.length === 0) {
          toast.error("الملف لا يحتوي على بيانات صالحة", {
            position: "top-center",
          })
          return
        }

        const first = allSheets[0]
        const total = Math.max(0, first.data.length - 1)

        setSheets(allSheets)
        setActiveSheetIndex(0)
        initializeMappings(first)
        setImportCount(maxRows === Infinity ? total : Math.min(maxRows, total))
      } catch (err) {
        console.error("[ExcelImporter]", err)
        toast.error(
          "تعذر قراءة الملف — تأكد أنه ملف Excel صالح (.xlsx / .xls)",
          {
            position: "top-center",
          }
        )
      } finally {
        setIsReadingFile(false)
        // ✦ لا نمسح قيمة input — المستخدم يختار ورقة أخرى بدون إعادة رفع
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }, 50)
  }

  // ── تبديل الورقة ────────────────────────────────────────
  const switchSheet = (idx: number) => {
    const sheet = sheets[idx]
    const total = Math.max(0, sheet.data.length - 1)
    setActiveSheetIndex(idx)
    initializeMappings(sheet)
    setImportCount(maxRows === Infinity ? total : Math.min(maxRows, total))
    setLastImport(null)
  }

  // ── تغيير عمود يدوياً ────────────────────────────────────
  const handleMappingChange = (index: number, newTarget: string) => {
    setMappings((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], targetKey: newTarget, autoMatched: false }
      return next
    })
  }

  // ── إعادة المطابقة التلقائية ─────────────────────────────
  const resetMappings = () => {
    if (!currentSheet) return
    const headerRow = currentSheet.data[0] ?? []
    setMappings(
      deduplicateMappings(
        headerRow.map((h: any, i: number) => {
          const { key, matched } = fuzzyMatch(
            h?.toString() ?? "",
            targetColumns
          )
          return { excelColIndex: i, targetKey: key, autoMatched: matched }
        })
      )
    )
  }

  // ── التحقق من صحة القيم ─────────────────────────────────
  const isValid = (value: any, key: string) => {
    const col = targetColumns.find((c) => c.key === key)
    if (!col?.numeric) return true
    return !isNaN(Number(value)) && value !== null && value !== ""
  }

  // ── الاستيراد ───────────────────────────────────────────
  const handleImportClick = async () => {
    // 1. فحص الأعمدة الإلزامية
    const requiredMissing = targetColumns
      .filter((tc) => tc.required)
      .filter(
        (tc) =>
          !mappings.some(
            (m) => m.targetKey === tc.key && !duplicateKeys.has(tc.key)
          )
      )

    if (requiredMissing.length > 0) {
      toast.error(
        `أعمدة إلزامية غير معيَّنة: ${requiredMissing.map((c) => c.label).join("، ")}`,
        { position: "top-center" }
      )
      return
    }

    // 2. تحذير من الأعمدة المكررة (لا نوقف العملية)
    if (duplicateKeys.size > 0) {
      toast.warning("يوجد أعمدة مكررة — سيُستخدم أول عمود مطابق فقط", {
        position: "top-center",
      })
    }

    setLoading(true)
    setProgress({ done: 0, total: importCount })

    try {
      // 3. بناء البيانات مع تجاهل الأعمدة المكررة (أول ظهور يكسب)
      const usedKeys = new Set<string>()
      const activeMappings = mappings.filter((m) => {
        if (m.targetKey === "ignore") return false
        if (usedKeys.has(m.targetKey)) return false
        usedKeys.add(m.targetKey)
        return true
      })

      const finalData = currentSheet.data
        .slice(1 + rowOffset, 1 + rowOffset + importCount)
        .map((row) => {
          const obj: Record<string, any> = {}
          activeMappings.forEach((m) => {
            const col = targetColumns.find((c) => c.key === m.targetKey)
            const raw = row[m.excelColIndex]
            obj[m.targetKey] = col?.numeric ? Number(raw) || 0 : raw
          })
          return { ...obj, ...presetFields }
        })

      // 4. استدعاء onImport مع callback للتقدم
      await onImport(finalData, (done, total) => {
        setProgress({ done, total })
      })

      setLastImport({ count: importCount, sheetName: currentSheet.name })
      // ✦ لا نحذف sheets — المستخدم يبقى في الواجهة ويختار ورقة أخرى
    } catch {
      // الخطأ يُعرض في useUpsert
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  // ── القيم المشتقة ────────────────────────────────────────
  const totalRowsInSheet = currentSheet
    ? Math.max(0, currentSheet.data.length - 1)
    : 0

  const rowsForPreview = useMemo(
    () =>
      currentSheet?.data.slice(
        1 + rowOffset,
        1 + rowOffset + Math.min(importCount, 100)
      ) ?? [],
    [currentSheet, importCount, rowOffset]
  )

  const hasErrors = useMemo(
    () =>
      rowsForPreview.some((row) =>
        mappings.some(
          (m) =>
            m.targetKey !== "ignore" &&
            !isValid(row[m.excelColIndex], m.targetKey)
        )
      ),
    [rowsForPreview, mappings] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ─────────────────────────────────────────────────────────
  // الواجهة
  // ─────────────────────────────────────────────────────────
  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      dir="rtl"
    >
      {/* ── منطقة رفع الملف ─────────────────────────────── */}
      {!currentSheet && (
        <div
          onClick={() => !isReadingFile && fileInputRef.current?.click()}
          className={`m-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all ${
            isReadingFile
              ? "cursor-wait border-slate-200 bg-slate-50"
              : "group cursor-pointer border-blue-200 hover:border-blue-400 hover:bg-blue-50/40"
          }`}
        >
          {isReadingFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="animate-pulse text-lg font-bold text-slate-600">
                جاري تحليل البيانات...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500 shadow-sm transition-transform group-hover:scale-110">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold text-slate-700">ارفع ملف Excel</p>
              <p className="mt-2 text-sm text-slate-400">
                .xlsx · .xls — تُطابَق الأعمدة تلقائياً وتُحفظ لكل ورقة
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />
        </div>
      )}

      {/* ── محتوى الملف ─────────────────────────────────── */}
      {currentSheet && (
        <>
          {/* شريط علوي: اسم الملف + زر رفع ملف جديد */}
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <svg
                className="h-4 w-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">
                {sheets.length} {sheets.length === 1 ? "ورقة" : "أوراق"} محمّلة
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">
                {totalRowsInSheet.toLocaleString("ar-SA")} صف في هذه الورقة
              </span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isReadingFile || loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              رفع ملف جديد
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
          </div>

          {/* تبويبات الأوراق */}
          {sheets.length > 1 && (
            <div className="flex overflow-x-auto border-b bg-slate-50 px-2">
              {sheets.map((s, i) => (
                <button
                  key={i}
                  onClick={() => switchSheet(i)}
                  disabled={loading}
                  className={`px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all disabled:opacity-50 ${
                    activeSheetIndex === i
                      ? "border-b-2 border-blue-600 bg-white text-blue-600"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {s.name}
                  <span className="mr-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-normal text-slate-600">
                    {Math.max(0, s.data.length - 1).toLocaleString("ar-SA")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* banner نجاح الاستيراد السابق */}
          {lastImport && (
            <div className="flex items-center justify-between border-b bg-emerald-50 px-4 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                تم استيراد {lastImport.count.toLocaleString("ar-SA")} سجل من «
                {lastImport.sheetName}» بنجاح
              </span>
              <button
                onClick={() => setLastImport(null)}
                className="text-emerald-400 hover:text-emerald-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* شريط التحكم */}
          <div className="space-y-3 border-b bg-white px-4 py-3">
            <MappingSummary
              mappings={mappings}
              targetColumns={targetColumns}
              duplicateKeys={duplicateKeys}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* التحكم في عدد الصفوف */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">استيراد</span>
                <input
                  type="number"
                  min={1}
                  max={maxRows === Infinity ? undefined : maxRows}
                  value={importCount}
                  disabled={loading}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    const cap =
                      maxRows === Infinity
                        ? totalRowsInSheet
                        : Math.min(maxRows, totalRowsInSheet)
                    setImportCount(Math.min(cap, Math.max(1, v)))
                  }}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center text-sm font-bold text-blue-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                />
                <span className="text-xs text-slate-500">من صف</span>
                <input
                  type="number"
                  min={0}
                  max={totalRowsInSheet - 1}
                  value={rowOffset}
                  onChange={(e) =>
                    setRowOffset(Math.max(0, Number(e.target.value)))
                  }
                  className="w-20 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-center text-sm font-bold text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-xs text-slate-400">
                  من أصل {totalRowsInSheet.toLocaleString("ar-SA")} صف
                </span>
                <button
                  disabled={loading}
                  onClick={() =>
                    setImportCount(
                      maxRows === Infinity
                        ? totalRowsInSheet
                        : Math.min(maxRows, totalRowsInSheet)
                    )
                  }
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  الكل
                </button>
              </div>

              {/* الأزرار */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetMappings}
                  disabled={loading}
                  title="إعادة المطابقة التلقائية"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إعادة المطابقة
                </button>

                <button
                  onClick={handleImportClick}
                  disabled={
                    loading ||
                    totalRowsInSheet === 0 ||
                    (duplicateKeys.size > 0 && false)
                  }
                  className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold text-white transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
                    hasErrors
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {hasErrors ? "⚠ " : ""}
                  {loading ? "جاري الاستيراد..." : buttonLabel}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {progress && <ProgressBar progress={progress} />}
          </div>

          {/* الجدول */}
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                <tr>
                  <th className="w-10 border-x border-slate-100 p-2 text-center text-xs font-normal text-slate-400">
                    #
                  </th>
                  {mappings.map((m, idx) => (
                    <MappingHeader
                      key={`hdr-${idx}`}
                      idx={idx}
                      mapping={m}
                      targetColumns={targetColumns}
                      excelColName={
                        currentSheet.data[0][m.excelColIndex]?.toString() ?? ""
                      }
                      isDuplicate={
                        m.targetKey !== "ignore" &&
                        duplicateKeys.has(m.targetKey)
                      }
                      onChange={handleMappingChange}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsForPreview.length === 0 ? (
                  <tr>
                    <td
                      colSpan={mappings.length + 1}
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      لا توجد صفوف للعرض
                    </td>
                  </tr>
                ) : (
                  rowsForPreview.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                    >
                      <td className="border-x border-slate-50 p-2 text-center text-xs text-slate-300 select-none">
                        {rIdx + 1}
                      </td>
                      {mappings.map((m, cIdx) => {
                        const raw = row[m.excelColIndex]
                        const ignored = m.targetKey === "ignore"
                        const isDupe =
                          !ignored && duplicateKeys.has(m.targetKey)
                        const hasError =
                          !ignored && !isDupe && !isValid(raw, m.targetKey)

                        return (
                          <td
                            key={`${rIdx}-${cIdx}`}
                            title={
                              hasError
                                ? "⚠ يجب أن تكون القيمة رقماً"
                                : raw?.toString()
                            }
                            className={`max-w-[200px] truncate border-x border-slate-50 p-2.5 text-sm ${
                              ignored || isDupe
                                ? "text-slate-200"
                                : hasError
                                  ? "bg-red-50 font-bold text-red-500"
                                  : "text-slate-700"
                            }`}
                          >
                            {ignored || isDupe
                              ? "—"
                              : raw?.toString() || (
                                  <span className="text-xs text-slate-300 italic">
                                    فارغ
                                  </span>
                                )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {rowsForPreview.length > 0 && (
              <div className="border-t bg-slate-50 px-4 py-2 text-right text-xs text-slate-400">
                عرض{" "}
                <span className="font-bold text-slate-600">
                  {rowsForPreview.length.toLocaleString("ar-SA")}
                </span>{" "}
                صف من أصل{" "}
                <span className="font-bold text-slate-600">
                  {totalRowsInSheet.toLocaleString("ar-SA")}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
