"use client"
import { X } from "lucide-react"
import { ReactNode } from "react"

export const Dialog = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  saveText = "حفظ",
  isLoading = false,
  isSaveDisabled = false, // <-- 1. أضفنا هذه الخاصية الجديدة
}: {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  title: string
  children: ReactNode
  saveText?: string
  isLoading?: boolean
  isSaveDisabled?: boolean // <-- 2. تعريف النوع
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all"
      dir="rtl"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* ... (الهيدر والمحتوى كما هما بدون تغيير) ... */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          {children}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 p-4">
          <button
            onClick={onClose}
            className="h-11 rounded-xl border border-input bg-background px-6 font-medium text-foreground transition-all hover:bg-secondary"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            // 3. تعطيل الزر إذا كان يحمل بيانات أو إذا كانت الحقول غير مكتملة
            disabled={isLoading || isSaveDisabled}
            className="h-11 rounded-xl bg-primary px-6 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "جاري الحفظ..." : saveText}
          </button>
        </div>
      </div>
    </div>
  )
}
