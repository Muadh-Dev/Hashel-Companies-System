"use client"
import { redirect, useRouter } from "next/navigation"
import React, { useMemo } from "react"
import {
  Users,
  Calendar,
  AlertCircle,
  Building2,
  FileText,
  Clock,
  Briefcase,
  ChevronLeft,
  Loader2,
  Banknote,
} from "lucide-react"
import { useTransactions } from "@/hooks/useTransactions"
import { useCompanies } from "@/hooks/useCompanies"
import { createClient } from "@/lib/supabase/supabaseSsrClient"
import { useAuth } from "@/context/AuthContext"

export default function EmployeeDashboard() {
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { companies, loading: companiesLoading } = useCompanies()
  const { user } = useAuth()

  const EMPLOYEE_NAME = user?.name?.trim().split(" ")[0] || "مستخدم"
  const COMPANY_NAME = "شركة هاشل اليامي"

  const isLoading = transactionsLoading || companiesLoading

  const router = useRouter()

  // ========== الإقامات المنتهية ==========
  const expiringIqamas = useMemo(() => {
    if (!transactions) return []
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(today.getDate() + 30)

    return transactions
      .filter((t) => {
        if (!t.expiry_date) return false
        const expiry = new Date(t.expiry_date)
        return expiry <= thirtyDaysLater && expiry >= today
      })
      .map((t) => {
        const company = companies?.find(
          (c) => c.unified_number === t.unified_number_of_company
        )
        return {
          id: t.id,
          name: t.resident_name,
          company: company?.company_owner || t.unified_number_of_company,
          iqama: t.iqama_number,
          daysLeft: Math.ceil(
            (new Date(t.expiry_date!).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          phone: t.phone_num != null ? t.phone_num.toString() : "",
        }
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [transactions, companies])

  // ========== السجلات التجارية ==========
  const expiringCRs = useMemo(() => {
    if (!companies) return []
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(today.getDate() + 30)

    return companies
      .filter((c) => {
        if (!c.cr_expiry_date) return false
        const expiry = new Date(c.cr_expiry_date)
        return expiry <= thirtyDaysLater && expiry >= today
      })
      .map((c) => ({
        id: c.id,
        name: c.company_owner,
        crNumber: c.crNumber.toString(),
        daysLeft: Math.ceil(
          (new Date(c.cr_expiry_date!).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [companies])

  // ========== الدفعات القادمة ==========
  const expiringPayments = useMemo(() => {
    if (!transactions) return []
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(today.getDate() + 30)

    return transactions
      .filter((t) => {
        if (!t.payment_date) return false
        if (!(t.agreed_amount > t.received_amount)) return false // لم يدفع كامل المبلغ
        const paymentDate = new Date(t.payment_date)
        return paymentDate <= thirtyDaysLater && paymentDate >= today
      })
      .map((t) => {
        const remaining = t.agreed_amount - t.received_amount
        return {
          id: t.id,
          name: t.resident_name,
          iqama: t.iqama_number,
          amount: t.agreed_amount,
          received: t.received_amount,
          remaining: remaining,
          daysLeft: Math.ceil(
            (new Date(t.payment_date!).getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [transactions])

  // ========== شاشة التحميل ==========
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-background p-6 text-foreground transition-colors duration-300 md:p-10"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ========== Header ========== */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              مرحباً،
              <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                {EMPLOYEE_NAME}
              </span>
            </h1>
            <p className="flex items-center gap-2 text-lg text-muted-foreground">
              <Building2 className="h-5 w-5 opacity-70" />
              <span>
                إليك التنبيهات والمهام التي تتطلب انتباهك اليوم في{" "}
                <strong className="text-foreground">{COMPANY_NAME}</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* ========== بطاقات الإحصائيات ========== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 1. الإقامات */}
          <StatCard
            icon={Users}
            iconBg="bg-red-50 text-red-500 dark:bg-red-500/10"
            hoverBorder="hover:border-red-500/30"
            bgCircle="bg-red-500/5"
            title="إقامات تتطلب التجديد"
            count={expiringIqamas.length}
            label="خلال 30 يوماً"
            labelColor="bg-red-500/10 text-red-500"
          />

          {/* 2. السجلات التجارية */}
          <StatCard
            icon={FileText}
            iconBg="bg-amber-50 text-amber-500 dark:bg-amber-500/10"
            hoverBorder="hover:border-amber-500/30"
            bgCircle="bg-amber-500/5"
            title="سجلات تتطلب التجديد"
            count={expiringCRs.length}
            label="خلال 30 يوماً"
            labelColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />

          {/* 3. الدفعات القادمة */}
          <StatCard
            icon={Banknote}
            iconBg="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
            hoverBorder="hover:border-emerald-500/30"
            bgCircle="bg-emerald-500/5"
            title="مدفوعات مستحقة قريباً"
            count={expiringPayments.length}
            label="خلال 30 يوماً"
            labelColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* ========== قوائم التنبيهات ========== */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* الإقامات */}
          <AlertSection
            title="تنبيهات الإقامات"
            icon={Briefcase}
            alertCount={expiringIqamas.length}
            items={expiringIqamas}
            renderItem={(item) => (
              <ListItem
                title={item.name}
                subtitle={`رقم الإقامة: ${item.iqama} • ${item.company}`}
                daysLeft={item.daysLeft}
                icon={Users}
                onClick={() =>
                  router.push(
                    `/operations?search=${encodeURIComponent(item.iqama)}`
                  )
                }
              />
            )}
            emptyText="لا توجد إقامات تنتهي قريباً"
          />

          {/* السجلات التجارية */}
          <AlertSection
            title="تنبيهات السجلات التجارية"
            icon={Building2}
            alertCount={expiringCRs.length}
            items={expiringCRs}
            renderItem={(item) => (
              <ListItem
                title={item.name}
                subtitle={`رقم السجل: ${item.crNumber}`}
                daysLeft={item.daysLeft}
                icon={FileText}
                onClick={() =>
                  router.push(
                    `/companies?search=${encodeURIComponent(item.crNumber)}`
                  )
                }
              />
            )}
            emptyText="لا توجد سجلات تنتهي قريباً"
          />

          {/* الدفعات القادمة */}
          <AlertSection
            title="تنبيهات المدفوعات"
            icon={Banknote}
            alertCount={expiringPayments.length}
            items={expiringPayments}
            renderItem={(item) => (
              <ListItem
                title={item.name}
                subtitle={`المبلغ: ${item.amount} | المدفوع: ${item.received} | المتبقي: ${item.remaining}`}
                daysLeft={item.daysLeft}
                icon={Banknote}
                onClick={() =>
                  router.push(
                    `/operations?search=${encodeURIComponent(item.iqama)}`
                  )
                }
              />
            )}
            emptyText="لا توجد مدفوعات مستحقة قريباً"
          />
        </div>
      </div>
    </div>
  )
}

// ==================== مكونات مساعدة ====================

// بطاقة الإحصائية
function StatCard({
  icon: Icon,
  iconBg,
  hoverBorder,
  bgCircle,
  title,
  count,
  label,
  labelColor,
}: {
  icon: any
  iconBg: string
  hoverBorder: string
  bgCircle: string
  title: string
  count: number
  label: string
  labelColor: string
}) {
  return (
    <div
      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all ${hoverBorder} hover:shadow-md`}
    >
      <div
        className={`absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full ${bgCircle} transition-transform group-hover:scale-150`}
      />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-muted-foreground">
          <Icon className={`h-5 w-5 ${iconBg.split(" ")[1]}`} />
          <h3>{title}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-foreground tabular-nums md:text-5xl">
            {count}
          </span>
          <span
            className={`rounded-md px-2 py-1 text-sm font-medium ${labelColor}`}
          >
            {label}
          </span>
        </div>
      </div>
      <div
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg} transition-transform group-hover:-translate-y-1`}
      >
        <AlertCircle className="h-8 w-8" />
      </div>
    </div>
  )
}

// قسم التنبيهات (قائمة)
function AlertSection({
  title,
  icon: Icon,
  alertCount,
  items,
  renderItem,
  emptyText,
  onItemClick, // جديد
}: {
  title: string
  icon: any
  alertCount: number
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  emptyText: string
  onItemClick?: (item: any) => void // دالة تستقبل العنصر وتنفذ التوجيه
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <SubHeader title={title} icon={Icon} alertCount={alertCount} />
        <button className="flex items-center gap-1 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
          عرض الكل <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex max-h-150 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="custom-scrollbar overflow-y-auto">
          <div className="divide-y divide-border">
            {items.length > 0 ? (
              items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderItem(item, index)}
                </React.Fragment>
              ))
            ) : (
              <EmptyState text={emptyText} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// العنوان الفرعي
const SubHeader = ({
  title,
  icon: Icon,
  alertCount,
}: {
  title: string
  icon: any
  alertCount?: number
}) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {alertCount !== undefined && alertCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
          {alertCount}
        </span>
      )}
    </div>
  </div>
)

// عنصر القائمة
const ListItem = ({
  title,
  subtitle,
  daysLeft,
  icon: Icon,
  onClick,
}: {
  title: string
  subtitle: string
  daysLeft: number
  icon: any
  onClick?: () => void
}) => {
  const isUrgent = daysLeft <= 10
  const statusColor = isUrgent
    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50"
    : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center ${
        onClick ? "cursor-pointer" : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* المحتوى كما هو بدون تغيير */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="leading-tight font-semibold text-foreground">
            {title}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div
        className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-bold ${statusColor}`}
      >
        <Calendar className="h-4 w-4" />
        متبقي {daysLeft} أيام
      </div>
    </div>
  )
}

// حالة فارغة
const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
      <AlertCircle className="h-8 w-8" />
    </div>
    <p className="font-medium text-muted-foreground">{text}</p>
  </div>
)
