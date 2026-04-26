"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  CreditCard,
  Home,
  Network,
  Settings,
  Briefcase,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
  User,
} from "lucide-react"

/**
 * تعريف الأنواع لعناصر التنقل
 */
interface NavItem {
  id: number
  title: string
  url: string
  icon: LucideIcon
}

const initialNavItems: NavItem[] = [
  { id: 1, title: "الصفحة الرئيسية", url: "/", icon: Home },
  { id: 2, title: "المعاملات", url: "/operations", icon: Briefcase },
  { id: 3, title: "ملف الشركات", url: "/companies", icon: Building2 },
  { id: 4, title: "الربط بين الشركات", url: "/linking", icon: Network },
  // { id: 5, title: "المعاملات البنكية", url: "/banking", icon: CreditCard },
  { id: 6, title: "الإعدادات", url: "/settings", icon: Settings },
]

export default function AppSidebar({ children }: any) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  // مزامنة حالة الشاشة لمنع مشاكل الـ Hydration في Next.js
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // التحكم في التمرير عند فتح قائمة الموبايل
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isMobileOpen ? "hidden" : "unset"
    }
  }, [isMobileOpen])

  // إذا كان المسار هو صفحة الدخول، لا تعرض شيئاً
  const isAuthPage = pathname.startsWith("/auth/login")
  if (isAuthPage) return null
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-amber-200 text-right dark:bg-slate-950"
      dir="rtl"
    >
      {/* زر الموبايل */}
      {/* <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 right-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-transform active:scale-95 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        aria-label="Open Menu"
      >
        <Menu className="size-5" />
      </button> */}

      {/* خلفية معتمة للموبايل */}
      {/* {isMobileOpen && (
        <div
          className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )} */}

      {/* Sidebar Container */}
      <aside
        className={`sticky inset-y-0 top-0 right-0 z-70 flex h-screen flex-col border-l border-slate-200 bg-white transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${isMobileOpen ? "w-72 translate-x-0" : "w-0 translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-72"} `}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header Section */}
          <div
            className={`flex min-h-20 items-center p-4 ${isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"}`}
          >
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex animate-in items-center gap-3 overflow-hidden duration-300 fade-in slide-in-from-right-4">
                <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-200 dark:shadow-none">
                  <Building2 className="size-5" />
                </div>
                <div className="grid min-w-0 flex-1 text-right leading-tight">
                  <span className="truncate text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    شركة هاشل اليامي
                  </span>
                  <span className="truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    إدارة العمليات
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() =>
                isMobileOpen
                  ? setIsMobileOpen(false)
                  : setIsCollapsed(!isCollapsed)
              }
              className={`rounded-lg border border-transparent p-2 text-slate-500 transition-all hover:bg-slate-50 active:scale-90 dark:text-slate-400 dark:hover:bg-slate-800 ${isCollapsed && !isMobileOpen ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" : ""} `}
            >
              {isMobileOpen ? (
                <X className="size-4" />
              ) : isCollapsed ? (
                <ChevronLeft className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>

          <div className="mx-4 mb-4 h-px bg-slate-100 dark:bg-slate-800/80" />

          {/* Navigation Items */}
          <nav className="custom-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3">
            <ul className="space-y-1.5">
              {initialNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <li key={item.id} className="group relative">
                    <Link
                      href={item.url}
                      onClick={() => {
                        if (window.innerWidth < 1024) setIsMobileOpen(false)
                      }}
                      className={`relative flex w-full items-center rounded-xl py-3 transition-all duration-200 outline-none ${isCollapsed && !isMobileOpen ? "justify-center px-0" : "justify-between px-4"} ${
                        isActive
                          ? "bg-blue-600 font-bold text-white shadow-lg shadow-blue-100 dark:shadow-none"
                          : "font-medium text-slate-500 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
                      } `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`size-5 shrink-0 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}
                        />
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="animate-in truncate text-sm fade-in slide-in-from-right-3">
                            {item.title}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="pointer-events-none absolute top-1/2 right-full z-50 mr-3 translate-x-2 -translate-y-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:bg-slate-700">
                        {item.title}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer User Profile Section */}
          <div
            className={`mt-auto border-t border-slate-100 p-4 dark:border-slate-800 ${isCollapsed && !isMobileOpen ? "flex justify-center" : ""}`}
          >
            <div
              className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 transition-all dark:border-slate-800 dark:bg-slate-800 ${isCollapsed && !isMobileOpen ? "h-11 w-11 justify-center p-0" : "w-full"}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-black text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-400">
                <User />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <>
                  <div className="flex min-w-0 animate-in flex-col fade-in slide-in-from-bottom-2">
                    <span className="text-xm truncate leading-none font-bold text-slate-800 dark:text-slate-100">
                      خالد الحوري
                    </span>
                  </div>
                  <button
                    className="mr-auto p-1.5 text-slate-400 transition-colors hover:text-red-500"
                    title="Log out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="dark:b no-scrollbar h-full flex-1 overflow-y-auto bg-white">
        {children}
      </div>
      {/* Custom Scrollbar Styling */}
      {/* <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `,
        }}
      /> */}
    </div>
  )
}
