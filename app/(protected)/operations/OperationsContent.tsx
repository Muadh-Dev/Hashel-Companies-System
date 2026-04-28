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
import { TransactionModal } from "./add"
import { Transaction } from "@/hooks/useTransactions"
import { addPaymentToTransaction, deleteTransaction } from "./upload"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import { toast } from "sonner"
import AddPaymentModal from "@/components/o/AddPaymentDialog"
import { useAuth } from "@/context/AuthContext"

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
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null) // 🆕
  const [isDeleting, setIsDeleting] = useState(false)
  const [addPaymentItem, setAddPaymentItem] = useState<Transaction | null>(null)
  // داخل المكون:
  const { user } = useAuth()
  const {
    transactions,
    loading,
    removeTransactionLocal,
    addTransactionLocal,
    updateTransactionLocal, // 🆕
  } = useTransactions()

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

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteTransaction(itemToDelete.id)
      removeTransactionLocal(itemToDelete.id)
      setItemToDelete(null)
    } catch (error) {
      toast.error("فشل الحذف", { position: "bottom-left" })
    } finally {
      setIsDeleting(false)
    }
  }

  // دالة فتح نافذة التعديل
  const handleEditRequest = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsAddOpen(true)
  }

  // بعد نجاح الحفظ/التحديث
  const handleSave = (savedTransaction: Transaction) => {
    if (editingTransaction) {
      // في حالة التعديل
      updateTransactionLocal(savedTransaction)
      setEditingTransaction(null)
    } else {
      // في حالة الإضافة
      addTransactionLocal(savedTransaction)
    }
    setIsAddOpen(false)
  }

  // عند إغلاق المودال، نلغي وضع التعديل
  const handleCloseModal = () => {
    setIsAddOpen(false)
    setEditingTransaction(null)
  }

  const handleAddPaymentSave = async (newAmount: number) => {
    if (!addPaymentItem) return
    const newTotalReceived = (addPaymentItem.received_amount || 0) + newAmount
    try {
      // تحديث في قاعدة البيانات
      const updatedTransaction = await addPaymentToTransaction(
        addPaymentItem.id,
        newTotalReceived
      )
      // تحديث محلياً
      updateTransactionLocal(updatedTransaction)
      toast.success(`تم إضافة ${newAmount.toLocaleString()} ر.س بنجاح`)
      setAddPaymentItem(null)
    } catch (error) {
      toast.error("فشل في تحديث المبلغ المستلم")
    }
  }

  useEffect(() => {
    const queryFromUrl = searchParams.get("search")
    if (queryFromUrl) setSearchQuery(queryFromUrl)
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
          onAddNew={() => {
            setEditingTransaction(null) // تأكيد وضع الإضافة
            setIsAddOpen(true)
          }}
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
          permissions={user?.permissions}
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
              onEditRequest={handleEditRequest} // 🆕
              onAddPaymentRequest={(item) => setAddPaymentItem(item)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <MobileAddButton
        onClick={() => {
          setEditingTransaction(null)
          setIsAddOpen(true)
        }}
      />

      {/* المودال يدعم الإضافة والتعديل معًا */}
      <TransactionModal
        isOpen={isAddOpen}
        setIsOpen={handleCloseModal} // 🆕 مهم لإلغاء التعديل عند الإغلاق
        onSave={handleSave} // 🆕 دالة موحدة
        activeTab={activeTab}
        initialData={editingTransaction} // 🆕
      />

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <AddPaymentModal
        isOpen={!!addPaymentItem}
        onClose={() => setAddPaymentItem(null)}
        personName={addPaymentItem?.resident_name || ""}
        agreedAmount={addPaymentItem?.agreed_amount || 0}
        previouslyReceivedAmount={addPaymentItem?.received_amount || 0}
        onSave={handleAddPaymentSave}
      />
    </div>
  )
}
