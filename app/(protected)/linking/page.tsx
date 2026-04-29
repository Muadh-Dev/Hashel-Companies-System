"use client"

import { useState, useMemo } from "react"
import { Companys, useConectCompanies } from "@/hooks/useConectCompanies"
import { deleteConectCompany } from "./upload"
import { Search, ShieldAlert } from "lucide-react" // تأكد من استيراد أيقونة البحث
import Header from "@/components/Header"
import TransactionTableCompanies from "@/components/c/connectCompaniesTable"
import { TransactionModal } from "./add"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import { useAuth } from "@/context/AuthContext"

export default function HomePage() {
  // حالة جديدة للتحكم في نافذة الحذف
  const [itemToDelete, setItemToDelete] = useState<Companys | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { conectCompanies, loading, addCompanyLocal, removeCompanyLocal } =
    useConectCompanies()
  const { user } = useAuth()

  // منطق البحث المزدوج
  const filteredData = useMemo(() => {
    if (!conectCompanies) return []
    if (!searchQuery.trim()) return conectCompanies

    return conectCompanies.filter((item) => {
      const searchLower = searchQuery.toLowerCase()
      // البحث في الخانة الأولى والخانة الثانية معاً
      return (
        String(item.com1).includes(searchLower) ||
        String(item.com2).includes(searchLower)
      )
    })
  }, [conectCompanies, searchQuery])

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteConectCompany(itemToDelete.id)
      removeCompanyLocal(itemToDelete.id)
      setItemToDelete(null) // إغلاق النافذة بعد النجاح
    } catch (error) {
      alert("فشل الحذف")
    } finally {
      setIsDeleting(false)
    }
  }

  const canAccessLinking =
    user?.role === "مدير" ||
    user?.role === "مشرف" ||
    user?.permissions?.linking === "edit"

  if (!canAccessLinking) {
    return (
      <div
        className="flex h-96 w-full items-center justify-center p-6"
        dir="rtl"
      >
        <div className="relative w-full max-w-sm">
          {/* تأثير هالة ضوئية خلفية ناعمة */}
          <div className="absolute -inset-4 rounded-full bg-rose-500/5 blur-3xl"></div>

          <div className="relative flex flex-col items-center space-y-5 rounded-3xl border border-border/50 bg-card/60 p-10 text-center shadow-2xl backdrop-blur-md">
            {/* أيقونة بتصميم زجاجي Glassmorphism */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-rose-50 to-rose-100 shadow-inner">
              <ShieldAlert className="h-10 w-10 text-rose-500/80" />
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full bg-rose-500/20"></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground/90">
                دخول غير مصرح به
              </h3>
              <p className="max-w-60 text-sm leading-relaxed text-muted-foreground/80">
                عذراً، لا تملك الصلاحيات الكافية لعرض محتويات هذه الصفحة حالياً.
              </p>
            </div>

            {/* خط زخرفي بسيط لإنهاء التصميم */}
            <div className="h-1 w-12 rounded-full bg-linear-to-r from-transparent via-rose-200 to-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-12 dark:bg-slate-950 dark:text-slate-100"
      dir="rtl"
    >
      <Header
        onAddNew={() => setIsModalOpen(true)}
        title="ربط الشركات"
        subtitle="إدارة وتتبع الربط بين المنشآت"
        buttonText="إضافة ربط"
      />

      <div className="mt-8 space-y-6">
        {/* شريط البحث المطور */}
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="ابحث برقم الشركة الأولى أو الثانية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white/50 pr-12 pl-4 text-sm font-medium backdrop-blur-md transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50"
          />
        </div>
        <div className="relative">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TransactionTableCompanies
              data={filteredData}
              // نمرر دالة تفتح النافذة وتحدد العنصر
              onDeleteRequest={(item) => setItemToDelete(item)}
            />
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSave={(newData) => addCompanyLocal(newData)}
      />

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
