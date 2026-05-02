// components/ExcelImporter/types.ts

export interface TargetColumn {
  key: string
  label: string
  numeric?: boolean
  required?: boolean
}

export interface ExcelImporterProps {
  targetColumns: TargetColumn[]
  /** يُستدعى بكل البيانات + callback للتقدم */
  onImport: (
    data: Record<string, any>[],
    onProgress: (done: number, total: number) => void
  ) => Promise<void>
  buttonLabel?: string
  /** الحد الأقصى للصفوف (الافتراضي: بلا حد) */
  maxRows?: number
}

export interface SheetData {
  name: string
  data: any[][]
}

export interface ColumnMapping {
  excelColIndex: number
  targetKey: string | "ignore"
  autoMatched: boolean
}

export interface ImportProgress {
  done: number
  total: number
}
