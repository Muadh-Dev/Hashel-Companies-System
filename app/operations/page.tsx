import { Suspense } from "react"
import OperationsContent from "./OperationsContent"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            جاري تحميل المعاملات...
          </p>
        </div>
      }
    >
      <OperationsContent />
    </Suspense>
  )
}
