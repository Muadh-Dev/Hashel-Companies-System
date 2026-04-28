"use client"

import { useState, useMemo } from "react"
import { useBankBalance, BankTransaction } from "@/hooks/useBankBalance"
import { deleteBankTransaction } from "./upload"
import { Search } from "lucide-react"
import Header from "@/components/Header"
import BankTransactionTable from "@/components/bank/BankTransactionTable"
import BankTransactionModal from "@/components/bank/BankTransactionModal"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"

export default function BankBalancePage() {
  const [itemToDelete, setItemToDelete] = useState<BankTransaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { transactions, loading, addTransactionLocal, removeTransactionLocal } =
    useBankBalance()

  // فلترة مزدوجة على العملية والوصف
  const filteredData = useMemo(() => {
    if (!transactions) return []
    if (!searchQuery.trim()) return transactions

    return transactions.filter((item) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        (item.operation?.toLowerCase() || "").includes(searchLower) ||
        (item.description?.toLowerCase() || "").includes(searchLower)
      )
    })
  }, [transactions, searchQuery])

  // حساب الإجماليات
  const totals = useMemo(() => {
    const totalDebit = filteredData.reduce((sum, t) => sum + (t.debit || 0), 0)
    const totalCredit = filteredData.reduce(
      (sum, t) => sum + (t.credit || 0),
      0
    )
    return {
      totalDebit,
      totalCredit,
      net: totalDebit - totalCredit,
    }
  }, [filteredData])

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteBankTransaction(itemToDelete.id)
      removeTransactionLocal(itemToDelete.id)
      setItemToDelete(null)
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
        title="رصيد البنك"
        subtitle="إدارة العمليات البنكية والرصيد"
        buttonText="إضافة عملية"
      />

      <div className="mt-8 space-y-6">
        {/* شريط البحث */}
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="ابحث في العملية أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white/50 pr-12 pl-4 text-sm font-medium backdrop-blur-md transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50"
          />
        </div>

        {/* بطاقة الملخص - تظهر في الأعلى وتثبت عند التمرير */}
        <div className="sticky top-4 z-20 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              إجمالي مدين:
            </span>
            <span className="text-xl font-bold text-green-700 dark:text-green-400">
              {totals.totalDebit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              إجمالي دائن:
            </span>
            <span className="text-xl font-bold text-red-700 dark:text-red-400">
              {totals.totalCredit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              الصافي:
            </span>
            <span
              className={`text-xl font-bold ${
                totals.net >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {totals.net.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <BankTransactionTable
              data={filteredData}
              onDeleteRequest={(item) => setItemToDelete(item)}
            />
          )}
        </div>
      </div>

      <BankTransactionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSave={(newData) => addTransactionLocal(newData)}
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
