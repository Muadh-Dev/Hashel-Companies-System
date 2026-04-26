"use client"

import { Plus, Moon, Sun } from "lucide-react"

type Props = {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onAddNew: () => void
}

export default function Header({
  isDarkMode,
  onToggleDarkMode,
  onAddNew,
}: Props) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div className="space-y-1">
        <h1 className="bg-linear-to-l from-blue-600 to-indigo-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          المعاملات
        </h1>
        <p className="font-medium text-slate-500 dark:text-slate-400">
          لوحة التحكم والمتابعة للمقيمين والرسوم
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* <button
          onClick={onToggleDarkMode}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-blue-600" />
          )}
        </button> */}

        <button
          onClick={onAddNew}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 dark:shadow-none"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة معاملة</span>
        </button>
      </div>
    </div>
  )
}
