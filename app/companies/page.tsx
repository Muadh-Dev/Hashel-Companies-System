"use client"

import { useState, useMemo } from "react"
import { useCompanies } from "@/hooks/useCompanies"
import Header from "@/components/Header"
import SearchAndFilters from "@/components/companies/SearchAndFiltersCompany"
import TransactionTableCompanies from "@/components/companies/CompanyTable"
import LoadingSpinner from "@/components/o/LoadingSpinner"
import EmptyState from "@/components/o/EmptyState"
import { toast } from "sonner"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("الكل")
  const [showExpanded, setShowExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "expiry">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { companies, loading } = useCompanies()

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

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 text-slate-900 transition-colors duration-300 md:p-12 dark:bg-slate-950 dark:text-slate-100"
      dir="rtl"
    >
      <Header
        onAddNew={() =>
          toast.warning("جاري العمل على هذا القسم", {
            position: "bottom-left",
          })
        }
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
        <div className="relative min-h-100">
          {loading ? (
            <LoadingSpinner />
          ) : filteredData.length > 0 ? (
            <TransactionTableCompanies
              data={filteredData}
              showExpanded={showExpanded}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}
