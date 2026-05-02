"use client"

import { useState, useMemo } from "react"
import { useCompanies, Company } from "@/hooks/useCompanies" // النسخة المحدثة
import Header from "@/components/Header"
import SearchAndFilters from "@/components/companies/SearchAndFiltersCompany"
import TransactionTableCompanies from "@/components/companies/CompanyTable"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import EmptyState from "@/components/o/EmptyState"
import { CompanyModal } from "./add" // أو المسار المناسب
import { deleteCompany } from "./upload"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { ShieldAlert } from "lucide-react"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("الكل")
  const [showExpanded, setShowExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "expiry">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()

  const {
    companies,
    loading,
    addCompanyLocal,
    removeCompanyLocal,
    updateCompanyLocal,
    count,
    totalEmployees,
    totalTransfers,
    totalVisas,
  } = useCompanies()

  const processed = useMemo(() => {
    if (!companies) return []
    return companies.map((item) => ({
      ...item,
      operationDate: item.created_at
        ? new Date(item.created_at).toLocaleDateString("ar-SA")
        : "-",
      daysRemaining: 0,
      remainingAmount: (item.total_costs || 0) - (item.exemption_amount || 0),
    }))
  }, [companies])

  const filteredData = useMemo(() => {
    let data = processed.filter((item) => {
      const owner = item.company_owner?.toLowerCase() || ""
      const unified = item.unified_number || ""
      const establishment = item.establishment_number || ""
      const social = item.social_insurance_number || ""
      const matchesSearch =
        owner.includes(searchQuery.toLowerCase()) ||
        unified.includes(searchQuery) ||
        establishment.includes(searchQuery) ||
        social.includes(searchQuery)
      const matchesTab = activeTab === "الكل" || item.entity_type === activeTab
      return matchesSearch && matchesTab
    })

    return data.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      } else {
        const remA = a.total_costs || 0
        const remB = b.total_costs || 0
        return sortOrder === "asc" ? remA - remB : remB - remA
      }
    })
  }, [processed, searchQuery, activeTab, sortBy, sortOrder])

  // === Handlers ===
  const handleAddNew = () => {
    setEditingCompany(null)
    setIsAddOpen(true)
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setIsAddOpen(true)
  }

  const handleSave = (company: Company) => {
    if (editingCompany) {
      updateCompanyLocal(company)
      setEditingCompany(null)
    } else {
      addCompanyLocal(company)
    }
    setIsAddOpen(false)
  }

  const handleDeleteRequest = (company: Company) => {
    setCompanyToDelete(company)
  }

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return
    setIsDeleting(true)
    try {
      await deleteCompany(companyToDelete.id)
      removeCompanyLocal(companyToDelete.id)
      setCompanyToDelete(null)
      toast.success("تم حذف الشركة بنجاح")
    } catch (error) {
      toast.error("فشل في حذف الشركة")
    } finally {
      setIsDeleting(false)
    }
  }

  const canAccessCompanies =
    user?.role === "مدير" ||
    user?.role === "مشرف" ||
    user?.permissions?.companies === "edit"

  if (!canAccessCompanies) {
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
      className="min-h-screen bg-slate-50 p-4 text-slate-900 transition-colors duration-300 md:p-12 dark:bg-slate-950 dark:text-slate-100"
      dir="rtl"
    >
      <Header
        onAddNew={handleAddNew}
        title="ملف الشركات"
        subtitle="لوحة تحكم إدارة الشركات"
        buttonText="إضافة شركة"
      />
      <div className="space-y-8">
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
        <div className="mb-4 flex flex-wrap items-center gap-6 px-2 text-sm font-medium text-slate-600">
          <div className="flex gap-1.5">
            <span>إجمالي الشركات:</span>
            <span className="text-blue-700">{count}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" /> {/* خط فاصل */}
          <div className="flex gap-1.5">
            <span>إجمالي الموظفين:</span>
            <span className="text-blue-700">{totalEmployees}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" /> {/* خط فاصل */}
          <div className="flex gap-1.5">
            <span>نقل الكفالة:</span>
            <span className="text-blue-700">{totalTransfers}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" /> {/* خط فاصل */}
          <div className="flex gap-1.5">
            <span>التأشيرات:</span>
            <span className="text-blue-700">{totalVisas}</span>
          </div>
        </div>
        <div className="relative min-h-100">
          {loading ? (
            <LoadingSpinner />
          ) : filteredData.length > 0 ? (
            <TransactionTableCompanies
              data={filteredData}
              showExpanded={showExpanded}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onEditRequest={handleEdit}
              onDeleteRequest={handleDeleteRequest}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <CompanyModal
        isOpen={isAddOpen}
        setIsOpen={(open) => {
          setIsAddOpen(open)
          if (!open) setEditingCompany(null)
        }}
        onSave={handleSave}
        initialData={editingCompany}
      />

      <DeleteConfirmModal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
