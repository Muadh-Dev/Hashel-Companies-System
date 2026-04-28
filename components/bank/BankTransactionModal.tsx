"use client"

import React, { useState } from "react"
import { Plus, X } from "lucide-react"
import { addBankTransaction } from "@/app/(protected)/banking/upload"
import { BankTransaction } from "@/hooks/useBankBalance"

export default function BankTransactionModal({
  isOpen,
  setIsOpen,
  onSave,
}: {
  isOpen: boolean
  setIsOpen: (o: boolean) => void
  onSave: (d: BankTransaction) => void
}) {
  const [data, setData] = useState<BankTransaction>({
    operation_date: new Date().toISOString().split("T")[0], // تاريخ اليوم
    operation: "",
    description: "",
    debit: 0,
    credit: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (
    field: keyof BankTransaction,
    value: string | number
  ) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative flex max-h-screen w-full max-w-2xl animate-in flex-col overflow-hidden rounded-none border border-border bg-card text-card-foreground shadow-2xl zoom-in-95 fade-in sm:max-h-[92vh] sm:rounded-[2rem]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                إضافة عملية بنكية
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 transition-colors hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 space-y-10 overflow-y-auto p-6 md:p-8">
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label text="تاريخ العملية" required />
                <input
                  type="date"
                  value={data.operation_date}
                  onChange={(e) =>
                    handleInputChange("operation_date", e.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label text="العملية" required />
                <Input
                  type="text"
                  placeholder="مثال: إيداع، سحب..."
                  value={data.operation}
                  onChange={(v: string) => handleInputChange("operation", v)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label text="الوصف" />
                <Input
                  type="text"
                  placeholder="تفاصيل إضافية..."
                  value={data.description}
                  onChange={(v: string) => handleInputChange("description", v)}
                />
              </div>
              <div className="space-y-2">
                <Label text="مدين" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data.debit || ""}
                  onChange={(v: string) =>
                    handleInputChange("debit", parseFloat(v) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label text="دائن" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data.credit || ""}
                  onChange={(v: string) =>
                    handleInputChange("credit", parseFloat(v) || 0)
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse justify-end gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row">
          <button
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="rounded-xl border border-border bg-card px-8 py-3 font-semibold"
          >
            إلغاء
          </button>
          <button
            disabled={isSubmitting}
            onClick={async () => {
              if (!data.operation) {
                alert("يرجى إدخال اسم العملية")
                return
              }

              try {
                setIsSubmitting(true)
                const insertedData = await addBankTransaction(data)
                onSave(insertedData || data)
                setIsOpen(false)
                setData({
                  operation_date: new Date().toISOString().split("T")[0],
                  operation: "",
                  description: "",
                  debit: 0,
                  credit: 0,
                })
              } catch (error) {
                console.error("خطأ أثناء الرفع:", error)
                alert("حدث خطأ أثناء الاتصال بقاعدة البيانات")
              } finally {
                setIsSubmitting(false)
              }
            }}
            className={`rounded-xl bg-primary px-10 py-3 font-bold text-primary-foreground transition-all hover:shadow-lg active:scale-95 ${
              isSubmitting ? "opacity-50" : ""
            }`}
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد وحفظ"}
          </button>
        </div>
      </div>
    </div>
  )
}

const Label = ({ text, required }: { text: string; required?: boolean }) => (
  <label className="block text-sm font-bold text-foreground/80">
    {text} {required && <span className="text-destructive">*</span>}
  </label>
)

const Input = ({ type = "text", placeholder, value, onChange }: any) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20"
  />
)
