import { LayoutDashboard } from "lucide-react"

export default function EmptyState() {
  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/30 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
        <LayoutDashboard className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">
        لا توجد سجلات
      </h3>
      <p className="text-slate-400">ابدأ بإضافة أول معاملة للنظام</p>
    </div>
  )
}
