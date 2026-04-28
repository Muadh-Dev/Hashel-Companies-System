"use client"

import { AlertCircle } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  // النصوص المخصصة (اختيارية)
  title?: string
  description?: string
  confirmText?: string
  loadingText?: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  // وضع القيم الافتراضية هنا
  title = "تأكيد الحذف",
  description = "هل أنت متأكد من رغبتك في حذف هذا الصف؟ هذه العملية لا يمكن التراجع عنها.",
  confirmText = "نعم، احذف",
  loadingText = "جاري الحذف...",
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-in rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8" />
          </div>

          {/* العنوان المتغير */}
          <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h3>

          {/* الوصف المتغير */}
          <p className="mb-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
            >
              {/* نص الزر المتغير حسب حالة التحميل */}
              {isDeleting ? loadingText : confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
