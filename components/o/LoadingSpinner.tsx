import { Loader2 } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="flex h-80 flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="animate-pulse font-medium text-slate-500">
        جاري جلب البيانات...
      </p>
    </div>
  )
}
