"use client"

import { useEffect } from "react"
import { Minus, X, LayoutGrid } from "lucide-react"

declare global {
  interface Window {
    Neutralino: any
  }
}

export default function TitleBar() {
  useEffect(() => {
    // 1. تهيئة Neutralino ومنع القوائم المزعجة
    if (typeof window !== "undefined" && window.Neutralino) {
      window.Neutralino.init()
      window.Neutralino.window.draggable("custom-title-bar")
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && (e.key === "p" || e.key === "P"))
      ) {
        e.preventDefault()
      }
    }

    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <header
      id="custom-title-bar"
      className="sticky top-0 left-0 z-10 flex h-12 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm select-none"
    >
      {/* جهة اليسار: الأيقونة والاسم */}
      <div className="flex items-center gap-3 text-gray-700">
        <LayoutGrid className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-bold tracking-tight">
          Hashel Companies System
        </span>
      </div>

      {/* جهة اليمين: أزرار التحكم */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => window.Neutralino?.window.minimize()}
          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 active:scale-95"
          title="تصغير"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.Neutralino?.window.exit()}
          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-red-500 hover:text-white active:scale-95"
          title="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
