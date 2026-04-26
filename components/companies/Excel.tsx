import { toast } from "sonner"

export function Excel() {
  return (
    <button
      onClick={() =>
        toast.info(
          "سيتم تفعيل هذا الزر حالما يتم التأكيد على أن جدول ملف الشركات جاهز ولا يوجد به تعديلات",
          { position: "top-center" }
        )
      }
      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
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
    </button>
  )
}
