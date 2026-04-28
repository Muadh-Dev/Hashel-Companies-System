"use client"

import React, { useState, useEffect, useMemo } from "react"
import { User, Mail, Shield, Lock } from "lucide-react"
import { Dialog } from "@/components/Dialog"
import { Input, Label, Select, SubHeader } from "@/components/ui-helpers"
import { toast } from "sonner"
import { User as UserType } from "@/hooks/useUsers"
import { addUser, updateUser } from "./uploadUsers"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (user: UserType) => void
  initialData?: UserType | null
}

export function AddUsersModal({ isOpen, onClose, onSave, initialData }: Props) {
  const isEditMode = !!initialData

  const [name, setName] = useState("")
  const [email, setEmail] = useState("") // الجزء قبل @
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setName(initialData.name || "")
        const emailName = initialData.email?.split("@")[0] || ""
        setEmail(emailName) // سنستخدمه لعرض النص فقط
        setIsAdmin(initialData.is_admin || false)
      } else {
        setName("")
        setEmail("")
        setIsAdmin(false)
      }
    }
  }, [isOpen, isEditMode, initialData])

  const isFormInvalid = useMemo(() => {
    if (!name.trim()) return true
    if (!isEditMode && !email.trim()) return true // الإيميل مطلوب فقط في الإضافة
    return false
  }, [name, email, isEditMode])

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      let user: UserType

      if (isEditMode && initialData) {
        // في التعديل: فقط الاسم والصلاحية
        user = await updateUser(initialData.id, {
          name: name.trim(),
          is_admin: isAdmin,
        })
        toast.success("تم تعديل بيانات المستخدم")
      } else {
        // في الإضافة: الاسم والإيميل والصلاحية
        const fullEmail = email.trim() + "@gmail.com"
        user = await addUser({
          name: name.trim(),
          email: fullEmail,
          is_admin: isAdmin,
        })
        toast.success("تم إضافة المستخدم بنجاح")
      }

      onSave(user)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={isEditMode ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
      isSaveDisabled={isFormInvalid || isSubmitting}
    >
      <div dir="rtl" className="space-y-6">
        <SubHeader title="البيانات الأساسية" icon={User} />

        <div className="space-y-7">
          {/* الاسم */}
          <div>
            <Label text="اسم المستخدم" required />
            <Input
              value={name}
              onChange={setName}
              placeholder="أدخل الاسم الكامل..."
            />
          </div>

          {/* الإيميل: قابل للتعديل فقط في وضع الإضافة */}
          {isEditMode ? (
            <div>
              <Label text="البريد الإلكتروني" />
              <div className="flex h-12 items-center rounded-xl border border-input bg-muted/30 px-4 text-foreground">
                <Mail className="ml-2 h-4 w-4 text-muted-foreground" />
                <span>{initialData?.email}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                البريد الإلكتروني غير قابل للتعديل
              </p>
            </div>
          ) : (
            <div>
              <Label text="البريد الإلكتروني" required />
              <div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center border-r border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                  gmail.com@
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example"
                  className="h-12 flex-1 bg-transparent px-4 text-foreground outline-none"
                  dir="ltr"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                أدخل اسم البريد الإلكتروني فقط (بدون @gmail.com)
              </p>
            </div>
          )}

          {/* الصلاحية */}
          <div>
            <Label text="الصلاحية" required />
            <Select
              value={isAdmin ? "مدير النظام" : "مدخل بيانات"}
              onChange={(val) => setIsAdmin(val === "مدير النظام")}
              options={["مدخل بيانات", "مدير النظام"]}
              placeholder={"اختر الصلاحية"}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
