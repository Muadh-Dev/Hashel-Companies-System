"use client"

import { useEffect, useState, useCallback } from "react"
import { Minus, X, LayoutGrid, Maximize2, Minimize2 } from "lucide-react"

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // دالة إرسال الأوامر إلى برنامج الـ .NET
  const sendToDotNet = useCallback((command: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).chrome?.webview) {
        ;(window as any).chrome.webview.postMessage(command)
      }
    } catch (error) {
      console.debug("WebView2 not available:", error)
    }
  }, [])

  // استقبال حالة التكبير من .NET
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "maximized") {
        setIsMaximized(true)
      } else if (event.data === "restored") {
        setIsMaximized(false)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("message", handleMessage)
    }

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  // تعطيل قائمة السياق الافتراضية
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleDragStart = (e: DragEvent) => e.preventDefault()

    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("dragstart", handleDragStart)

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("dragstart", handleDragStart)
    }
  }, [])

  const handleMaximizeToggle = useCallback(() => {
    sendToDotNet(isMaximized ? "restore" : "maximize")
    setIsMaximized(!isMaximized)
  }, [isMaximized, sendToDotNet])

  return (
    <header
      onPointerDown={() => sendToDotNet("drag")}
      onDoubleClick={handleMaximizeToggle}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }}
      className="group/header relative top-0 left-0 z-9999 flex h-11 w-full items-center justify-between overflow-hidden border-b border-gray-200/30 bg-linear-to-r from-white via-gray-50/80 to-white px-3 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur-xl select-none dark:border-slate-700/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)]"
    >
      {/* تأثير إضاءة متتبع للماوس في الخلفية */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/header:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.03), transparent 60%)`,
        }}
      />

      {/* Left Section - Logo & Title */}
      <div
        className="relative z-10 flex items-center gap-3"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Logo Container with Glow Effect */}
        <div className="group/logo relative">
          {/* تأثير التوهج الدائري */}
          <div className="absolute -inset-1 rounded-lg bg-blue-500/0 blur-md transition-all duration-300 group-hover/logo:bg-blue-500/15 dark:group-hover/logo:bg-blue-400/10" />

          {/* تأثير التوهج الداخلي */}
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100 dark:from-blue-400/5" />

          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-blue-100/50 bg-linear-to-br from-blue-50 to-white shadow-sm transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:border-blue-200 group-hover/logo:shadow-md dark:border-blue-900/30 dark:from-blue-950/50 dark:to-slate-900 dark:group-hover/logo:border-blue-800">
            <LayoutGrid
              className="h-3.5 w-3.5 text-blue-600 transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-12 dark:text-blue-400"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Title with Hover Effect */}
        <div className="group/title flex cursor-default flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] leading-tight font-semibold tracking-tight text-gray-800 transition-all duration-300 group-hover/title:text-gray-900 dark:text-slate-100 dark:group-hover/title:text-white">
              Hashel Companies System
            </span>
            {/* شارة صغيرة */}
            <span className="hidden rounded-md border border-blue-200/30 bg-linear-to-r from-blue-500/10 to-blue-600/10 px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-blue-600 uppercase transition-all duration-300 group-hover/title:border-blue-300 group-hover/title:shadow-sm sm:inline-block dark:border-blue-800/30 dark:from-blue-400/10 dark:to-blue-300/10 dark:text-blue-400 dark:group-hover/title:border-blue-700">
              Pro
            </span>
          </div>
          <span className="text-[9px] leading-tight font-medium tracking-wider text-gray-400 uppercase transition-colors duration-300 group-hover/title:text-gray-500 dark:text-slate-500 dark:group-hover/title:text-slate-400">
            Enterprise v2.0
          </span>
        </div>
      </div>

      {/* Right Section - Window Controls */}
      <div
        className="relative z-10 flex items-center gap-0.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Minimize Button */}
        <button
          onClick={() => sendToDotNet("minimize")}
          onMouseEnter={() => setHoveredButton("minimize")}
          onMouseLeave={() => setHoveredButton(null)}
          className="group/btn relative flex h-8 w-11 items-center justify-center overflow-hidden rounded-md transition-all duration-300 hover:bg-gray-200/50 active:scale-95 dark:hover:bg-slate-800/50"
          title="Minimize"
          aria-label="Minimize window"
        >
          {/* تأثير الخلفية المتدرجة */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-100/0 opacity-0 transition-all duration-300 group-hover/btn:to-gray-100/50 group-hover/btn:opacity-100 dark:to-slate-700/0 dark:group-hover/btn:to-slate-700/30" />

          {/* تأثير التموج */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

          <Minus
            className={`relative h-3.5 w-3.5 transition-all duration-300 ${
              hoveredButton === "minimize"
                ? "scale-110 text-gray-700 dark:text-slate-200"
                : "text-gray-400 dark:text-slate-500"
            } group-hover/btn:-translate-y-px`}
            strokeWidth={2.5}
          />

          {/* الخط السفلي عند التحويم */}
          <div
            className={`absolute bottom-1.5 left-1/2 h-0.5 rounded-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-300 dark:from-blue-500 dark:to-blue-400 ${
              hoveredButton === "minimize"
                ? "w-3 -translate-x-1/2 opacity-100"
                : "w-0 opacity-0"
            }`}
          />
        </button>

        {/* Maximize/Restore Button */}
        <button
          onClick={handleMaximizeToggle}
          onMouseEnter={() => setHoveredButton("maximize")}
          onMouseLeave={() => setHoveredButton(null)}
          className="group/btn relative flex h-8 w-11 items-center justify-center overflow-hidden rounded-md transition-all duration-300 hover:bg-gray-200/50 active:scale-95 dark:hover:bg-slate-800/50"
          title={isMaximized ? "Restore" : "Maximize"}
          aria-label={isMaximized ? "Restore window" : "Maximize window"}
        >
          {/* تأثير الخلفية المتدرجة */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-100/0 opacity-0 transition-all duration-300 group-hover/btn:to-gray-100/50 group-hover/btn:opacity-100 dark:to-slate-700/0 dark:group-hover/btn:to-slate-700/30" />

          {/* تأثير التموج */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

          {isMaximized ? (
            <Minimize2
              className={`relative h-3.5 w-3.5 transition-all duration-300 ${
                hoveredButton === "maximize"
                  ? "scale-110 text-gray-700 dark:text-slate-200"
                  : "text-gray-400 dark:text-slate-500"
              } group-hover/btn:rotate-180`}
              strokeWidth={2.5}
            />
          ) : (
            <Maximize2
              className={`relative h-3.5 w-3.5 transition-all duration-300 ${
                hoveredButton === "maximize"
                  ? "scale-110 text-gray-700 dark:text-slate-200"
                  : "text-gray-400 dark:text-slate-500"
              } group-hover/btn:scale-110`}
              strokeWidth={2.5}
            />
          )}

          {/* الخط السفلي عند التحويم */}
          <div
            className={`absolute bottom-1.5 left-1/2 h-0.5 rounded-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-300 dark:from-blue-500 dark:to-blue-400 ${
              hoveredButton === "maximize"
                ? "w-3 -translate-x-1/2 opacity-100"
                : "w-0 opacity-0"
            }`}
          />
        </button>

        {/* Close Button */}
        <button
          onClick={() => sendToDotNet("close")}
          onMouseEnter={() => setHoveredButton("close")}
          onMouseLeave={() => setHoveredButton(null)}
          className="group/btn relative ml-0.5 flex h-8 w-11 items-center justify-center overflow-hidden rounded-md transition-all duration-300 hover:bg-red-500/90 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 dark:hover:bg-red-600/90 dark:hover:shadow-red-600/30"
          title="Close"
          aria-label="Close window"
        >
          {/* تأثير الخلفية المشعة */}
          <div className="absolute inset-0 bg-linear-to-br from-red-400/0 via-red-500/0 to-red-600/0 transition-all duration-300 group-hover/btn:from-red-400/50 group-hover/btn:via-red-500/50 group-hover/btn:to-red-600/50" />

          {/* تأثير الوميض */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/0 to-transparent transition-all duration-500 group-hover/btn:translate-x-full group-hover/btn:via-white/20" />

          {/* تأثير التوهج الداخلي */}
          <div className="absolute inset-0.5 rounded-md bg-linear-to-t from-black/0 to-white/0 transition-all duration-300 group-hover/btn:from-black/10 group-hover/btn:to-white/5" />

          <X
            className={`relative h-3.5 w-3.5 transition-all duration-300 ${
              hoveredButton === "close"
                ? "scale-110 rotate-90 text-white"
                : "text-gray-400 dark:text-slate-500"
            } group-hover/btn:-translate-y-px`}
            strokeWidth={2.5}
          />

          {/* حلقة حول الأيقونة عند التحويم */}
          <div
            className={`absolute inset-0 m-auto h-5 w-5 rounded-full border border-white/0 transition-all duration-300 ${
              hoveredButton === "close"
                ? "scale-100 border-white/30 opacity-100"
                : "scale-50 opacity-0"
            }`}
          />
        </button>
      </div>
    </header>
  )
}
