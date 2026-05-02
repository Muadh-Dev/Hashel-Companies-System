"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash, ShieldAlert } from "lucide-react"
import { useUsers, type User } from "@/hooks/useUsers"
import { useAuth } from "@/context/AuthContext"
import { AddUsersModal } from "./add"
import { deleteUser } from "./uploadUsers"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// دالة مساعدة لتحويل الصلاحيات إلى نص مفهوم للعرض
function formatPermissions(user: User): string {
  if (!user.permissions) return ""
  const map: Record<string, string> = {
    companies: "ملف الشركات",
    linking: "الربط بين الشركات",
    bankBalance: "الرصيد البنكي",
    sponsorshipTransfer: "نقل الكفالة",
    visaIssuance: "إصدار تأشيرة",
    annualRenewal: "التجديد سنوي",
    importData: "استيراد البيانات",
  }
  const items = Object.entries(user.permissions)
    .filter(([, v]) => v !== "none")
    .map(([k, v]) => `${map[k] || k} (${v === "edit" ? "تعديل" : "مشاهدة"})`)
  return items.join("، ")
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { users, loading, addUserLocal, updateUserLocal, removeUserLocal } =
    useUsers()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // حماية الصفحة: المدير فقط
  if (currentUser?.role !== "مدير") {
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
                هذه الصفحة مخصصة لمدير النظام فقط!
              </p>
            </div>

            {/* خط زخرفي بسيط لإنهاء التصميم */}
            <div className="h-1 w-12 rounded-full bg-linear-to-r from-transparent via-rose-200 to-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleAddNew = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSave = (user: User) => {
    if (editingUser) {
      updateUserLocal(user)
    } else {
      addUserLocal(user)
    }
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleDeleteRequest = (user: User) => {
    setDeleteTarget(user)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      removeUserLocal(deleteTarget.id)
      toast.success("تم حذف المستخدم بنجاح")
      setDeleteTarget(null)
    } catch (error) {
      toast.error("فشل في حذف المستخدم")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <button
          onClick={handleAddNew}
          className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:shadow-lg"
        >
          + إضافة مستخدم
        </button>
      </div>

      {loading && (
        <p className="text-center text-muted-foreground">جاري التحميل...</p>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-right font-bold">الاسم</th>
                <th className="p-4 text-right font-bold">الإيميل</th>
                <th className="p-4 text-right font-bold">الدور والصلاحيات</th>
                <th className="p-4 text-right font-bold">تاريخ الإنشاء</th>
                <th className="p-4 text-center font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          user.role === "مدير"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : user.role === "مشرف"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
                        }`}
                      >
                        {user.role === "مدير"
                          ? "مدير"
                          : user.role === "مشرف"
                            ? "مشرف"
                            : "مخصص"}
                      </span>
                      {user.role === "مخصص" && user.permissions && (
                        <span
                          className="line-clamp-1 text-xs text-muted-foreground"
                          title={formatPermissions(user)}
                        >
                          {formatPermissions(user) || "بدون صلاحيات"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">فتح القائمة</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(user)}
                          className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddUsersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingUser}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
