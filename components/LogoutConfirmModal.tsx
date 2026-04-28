"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import DeleteConfirmModal from "./DeleteConfirmModal" // تأكد من المسار

export default function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { signOut } = useAuth()

  const handleConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* الزر الذي سيظهر في الواجهة */}
      <button
        onClick={() => setIsOpen(true)}
        className="mr-auto p-1.5 text-slate-400 transition-colors hover:text-red-500"
        title="تسجيل الخروج"
      >
        <LogOut className="size-4" />
      </button>

      {/* المودال مخفي ولن يظهر إلا عند ضغط الزر أعلاه */}
      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        isDeleting={isLoggingOut}
        title="تأكيد تسجيل الخروج"
        description="هل أنت متأكد أنك تريد إنهاء الجلسة الحالية؟"
        confirmText="نعم، سجل خروج"
        loadingText="جاري الخروج..."
      />
    </>
  )
}
