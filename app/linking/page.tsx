"use client"

import { useState, useMemo } from "react"
import { Companys, useConectCompanies } from "@/hooks/useConectCompanies"
import { deleteConectCompany } from "./upload"
import { Search } from "lucide-react" // تأكد من استيراد أيقونة البحث
import Header from "@/components/Header"
import TransactionTableCompanies from "@/components/c/connectCompaniesTable"
import { TransactionModal } from "./add"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"

export default function HomePage() {
  // حالة جديدة للتحكم في نافذة الحذف
  const [itemToDelete, setItemToDelete] = useState<Companys | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { conectCompanies, loading, addCompanyLocal, removeCompanyLocal } =
    useConectCompanies()

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
