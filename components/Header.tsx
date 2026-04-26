"use client"

import { Plus } from "lucide-react"

type Props = {
  onAddNew: () => void
  title: string
  subtitle: string
  buttonText: string
}

export default function Header({
  onAddNew,
  title,
  subtitle,
  buttonText,
}: Props) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div className="space-y-1">
        <h1 className="bg-linear-to-l from-blue-600 to-indigo-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          {title}
        </h1>
        <p className="font-medium text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAddNew}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 dark:shadow-none"
        >
          <Plus className="h-5 w-5" />
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  )
}
