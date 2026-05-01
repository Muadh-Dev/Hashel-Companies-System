// components/ExcelImporter/types.ts

export interface TargetColumn {
  key: string
  /** التسمية تُستخدم أيضاً للمطابقة التلقائية مع رؤوس الإكسل */
  label: string
  numeric?: boolean
  /** عمود إلزامي — يظهر تحذير إن لم يُعيَّن */
  required?: boolean
}

export interface ExcelImporterProps {
  targetColumns: TargetColumn[]
  onImport: (data: any[]) => Promise<void>
  buttonLabel?: string
  /** الحد الأقصى للصفوف القابلة للاستيراد في الدفعة الواحدة (الافتراضي: بلا حد) */
  maxRows?: number
}

export interface SheetData {
  name: string
  data: any[][]
}

export interface ColumnMapping {
  excelColIndex: number
  targetKey: string | "ignore"
  /** true = مطابقة تلقائية / false = اختيار يدوي */
  autoMatched: boolean
}
