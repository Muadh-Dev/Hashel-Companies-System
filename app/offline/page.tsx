"use client"

import { WifiOff, RefreshCw, PhoneCall } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/" // العودة للرئيسية إذا عاد الاتصال
    } else {
      // تأثير بصري بسيط عند الضغط وعدم وجود اتصال
      const btn = document.getElementById("retry-btn")
      btn?.classList.add("animate-shake")
      setTimeout(() => btn?.classList.remove("animate-shake"), 500)
    }
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg text-center">
        {/* الدوائر الخلفية الزخرفية */}
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative space-y-8 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          {/* أيقونة الحالة */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <WifiOff className="h-12 w-12 stroke-[1.5]" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              انقطع الاتصال بالإنترنت
            </h1>
            <p className="mx-auto max-w-xs text-slate-500 dark:text-slate-400">
              عذراً، يبدو أنك غير متصل بالشبكة حالياً. يرجى التحقق من إعدادات
              الواي فاي أو بيانات الهاتف.
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              id="retry-btn"
              onClick={handleRetry}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              <RefreshCw className="h-5 w-5" />
              إعادة المحاولة
            </button>

            {/* <a
              href="tel:+966500000000" // ضع رقم الدعم الفني هنا
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <PhoneCall className="h-5 w-5" />
              الدعم الفني
            </a> */}
          </div>

          {/* تذييل بسيط */}
          <div className="pt-4 text-xs text-slate-400">
            نظام شركات هاشل اليامي &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  )
}
