"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { useUsers, type User } from "@/hooks/useUsers"
import { AddUsersModal } from "./add"
import { deleteUser } from "./uploadUsers"
import DeleteConfirmModal from "@/components/DeleteConfirmModal" // تأكد من مسار المكون
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const { users, loading, addUserLocal, updateUserLocal, removeUserLocal } =
    useUsers()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // حالات الحذف
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // فتح مودال تأكيد الحذف
  const handleDeleteRequest = (user: User) => {
    setDeleteTarget(user)
  }

  // تنفيذ الحذف بعد التأكيد
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      removeUserLocal(deleteTarget.id)
      toast.success("تم حذف المستخدم بنجاح")
      setDeleteTarget(null) // إغلاق المودال
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
                <th className="p-4 text-right font-bold">الصلاحية</th>
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
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        user.is_admin
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {user.is_admin ? "مدير النظام" : "مدخل بيانات"}
                    </span>
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

      {/* مودال تأكيد الحذف */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
