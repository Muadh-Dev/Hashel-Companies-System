"use client"

import { useEffect, useState } from "react"
import { Minus, X, LayoutGrid } from "lucide-react"

declare global {
  interface Window {
    Neutralino: any
  }
}

export default function TitleBar() {
  const [isNeutralinoReady, setIsNeutralinoReady] = useState(false)

  useEffect(() => {
    const setupTitleBar = async () => {
      try {
        if (typeof window !== "undefined" && window.Neutralino) {
          // انتظر حتى يكون Neutralino جاهزاً
          await new Promise((resolve) => {
            if (window.Neutralino.init) {
              window.Neutralino.init()
            }
            // انتظر قليلاً للتأكد من التهيئة
            setTimeout(resolve, 100)
          })

          // تعيين منطقة السحب
          await window.Neutralino.window.setDraggableRegion("custom-title-bar")
          setIsNeutralinoReady(true)
          console.log("Title bar setup successful")
        }
      } catch (error) {
        console.error("Failed to setup title bar:", error)
      }
    }

    setupTitleBar()

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

  const handleMinimize = async () => {
    try {
      if (window.Neutralino) {
        await window.Neutralino.window.minimize()
      }
    } catch (error) {
      console.error("Minimize failed:", error)
    }
  }

  const handleClose = async () => {
    try {
      if (window.Neutralino) {
        await window.Neutralino.app.exit()
      }
    } catch (error) {
      console.error("Close failed:", error)
    }
  }

  return (
    <header
      id="custom-title-bar"
      className="sticky top-0 left-0 z-10 flex h-12 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm select-none"
      // style={{ WebkitAppRegion: "drag" }} // ✅ مهم لـ Electron/Neutralino
    >
      <div
        className="flex items-center gap-3 text-gray-700"
        // style={{ WebkitAppRegion: "no-drag" }} // منع السحب على الأزرار
      >
        <LayoutGrid className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-bold tracking-tight">
          Hashel Companies System
        </span>
      </div>

      <div
        className="flex items-center gap-1"
        // style={{ WebkitAppRegion: "no-drag" }} // منع السحب على الأزرار
      >
        <button
          onClick={handleMinimize}
          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 active:scale-95"
          title="تصغير"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-gray-500 transition-all hover:bg-red-500 hover:text-white active:scale-95"
          title="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
