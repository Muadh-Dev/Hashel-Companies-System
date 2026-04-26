"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTransactions } from "@/hooks/useTransactions"
import Header from "@/components/o/Header"
import SearchAndFilters from "@/components/o/SearchAndFilters"
import TransactionTable from "@/components/o/TransactionTable"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import EmptyState from "@/components/o/EmptyState"
import MobileAddButton from "@/components/o/MobileAddButton"
import { TransactionData, TransactionModal } from "./add"
import { Transaction } from "@/hooks/useTransactions"
import { deleteTransactions } from "./upload"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"

type Props = {
  item: Transaction & {
    operationDate: string
    daysRemaining: number
    remainingAmount: number
  }
  showExpanded: boolean
}

export default function OperationsContent() {
  const searchParams = useSearchParams()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("الكل")
  const [showExpanded, setShowExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "expiry">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { transactions, loading, removeTransLocal } = useTransactions()

  // معالجة البيانات وحساب أيام المتبقية والمبالغ
  const processed = useMemo(() => {
    if (!transactions) return []
    return transactions.map((item) => {
      const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null
      const diffTime = expiryDate ? expiryDate.getTime() - Date.now() : 0
      const daysRemaining = expiryDate
        ? Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        : 0

      return {
        ...item,
        operationDate: item.created_at
          ? new Date(item.created_at).toLocaleDateString("ar-SA")
          : "-",
        daysRemaining,
        remainingAmount:
          (item.agreed_amount || 0) - (item.received_amount || 0),
      }
    })
  }, [transactions])

  const handleSaveTransaction = (data: TransactionData) => {
    console.log("تم استلام البيانات في الصفحة الرئيسية:", data)
    // هنا يمكنك تحديث القائمة المحلية (List) بالبيانات الجديدة
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteTransactions(itemToDelete.id)
      removeTransLocal(itemToDelete.id)
      setItemToDelete(null) // إغلاق النافذة بعد النجاح
    } catch (error) {
      alert("فشل الحذف")
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const queryFromUrl = searchParams.get("search")
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl)
    }
  }, [searchParams])

  // تصفية وفرز
  const filteredData = useMemo(() => {
    let data = processed.filter((item) => {
      const name = item.resident_name?.toLowerCase() || ""
      const idNum = item.iqama_number || ""
      const idEst = item.companies?.establishment_number || ""
      const idSocial = item.companies?.social_insurance_number || ""
      const idUnified = item.unified_number_of_company || ""
      const idMemo = item.memo_number || ""
      const matchesSearch =
        name.includes(searchQuery.toLowerCase()) ||
        idNum.includes(searchQuery) ||
        idEst.includes(searchQuery) ||
        idSocial.includes(searchQuery) ||
        idUnified.includes(searchQuery) ||
        idMemo.includes(searchQuery)
      const matchesTab = activeTab === "الكل" || item.service_type === activeTab
      return matchesSearch && matchesTab
    })

    return data.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      } else {
        const remA = a.daysRemaining || 0
        const remB = b.daysRemaining || 0
        return sortOrder === "asc" ? remA - remB : remB - remA
      }
    })
  }, [processed, searchQuery, activeTab, sortBy, sortOrder])

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 text-slate-900 transition-colors duration-300 md:p-12 dark:bg-slate-950 dark:text-slate-100"
      dir="rtl"
    >
      <div className="space-y-8">
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onAddNew={() => setIsAddOpen(true)}
        />

        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderToggle={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showExpanded={showExpanded}
          onToggleExpanded={() => setShowExpanded(!showExpanded)}
        />

        <div className="relative min-h-100">
          {loading ? (
            <LoadingSpinner />
          ) : filteredData.length > 0 ? (
            <TransactionTable
              data={filteredData}
              showExpanded={showExpanded}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onDeleteRequest={(item) => setItemToDelete(item)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <MobileAddButton onClick={() => setIsAddOpen(true)} />

      <TransactionModal
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        onSave={handleSaveTransaction}
        activeTab={activeTab}
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
