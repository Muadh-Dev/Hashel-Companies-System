"use client"

import React, { useState, useEffect } from "react"
import { AlertCircle, Plus, Wallet } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  personName: string
  agreedAmount: number
  previouslyReceivedAmount: number
  onSave: (newAmount: number) => void
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  personName,
  agreedAmount,
  previouslyReceivedAmount,
  onSave,
}: Props) {
  const [currentAmount, setCurrentAmount] = useState<number | "">("")
  const [error, setError] = useState<string>("")

  // الحسابات
  const remainingAmount = agreedAmount - previouslyReceivedAmount

  useEffect(() => {
    if (isOpen) {
      setCurrentAmount("")
      setError("")
    }
  }, [isOpen])

  const handleSave = () => {
    const amountToSave = Number(currentAmount)
    if (!amountToSave || amountToSave <= 0) {
      setError("الرجاء إدخال مبلغ صحيح.")
      return
    }
    if (amountToSave > remainingAmount) {
      setError(`المبلغ يتجاوز المتبقي (${remainingAmount}).`)
      return
    }
    onSave(amountToSave)
    onClose()
  }

  if (!isOpen) return null

  return (
    // التوجيه لليمين (RTL) مفعل هنا على مستوى الحاوية
    <div
      className="fixed inset-0 z-110 flex items-center justify-center p-4"
      dir="rtl"
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-in rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              إضافة مبلغ مالي
            </h3>
          </div>

          {/* Info Box - البيانات كاملة هنا */}
          <div className="mb-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="flex items-center">
              <span className="ml-1 text-right font-medium text-slate-500 dark:text-slate-400">
                اسم الشخص:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {personName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                المبلغ المتفق عليه:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {agreedAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-green-600 dark:text-green-400">
              <span className="font-medium">المستلم سابقاً:</span>
              <span className="font-bold">
                {previouslyReceivedAmount.toLocaleString()}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                الرصيد المتبقي:
              </span>
              <span className="text-2xl font-black text-red-500">
                {remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Input Field */}
          <div className="relative mb-8 space-y-2">
            <label
              htmlFor="currentAmount"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              المبلغ المستلم الآن
            </label>
            <input
              id="currentAmount"
              type="number"
              placeholder="0"
              value={currentAmount === 0 ? "" : currentAmount}
              onChange={(e) => {
                setCurrentAmount(parseFloat(e.target.value) || "")
                if (error) setError("")
              }}
              onFocus={(e) => e.target.select()}
              className={`h-14 w-full rounded-xl border bg-white px-4 text-right text-xl font-bold transition-all outline-none focus:ring-2 dark:bg-slate-950 ${
                error
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 dark:border-slate-700"
              }`}
            />
            {error && (
              <div className="absolute -bottom-5 mt-2 flex items-center gap-1.5 text-xs font-bold text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button
              onClick={handleSave}
              className="flex-2 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:shadow-lg active:scale-95 dark:bg-white dark:text-slate-900"
            >
              تأكيد وحفظ
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-4 font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
