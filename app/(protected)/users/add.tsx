// add.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { User, Phone } from "lucide-react"
import { Dialog } from "@/components/Dialog"
import { Input, Label, Select, SubHeader } from "@/components/ui-helpers"
import { toast } from "sonner"
import { User as UserType } from "@/hooks/useUsers"
import { createUserWithPhone, updateUser } from "./uploadUsers"

type Role = "مدير" | "مشرف" | "مخصص"
type PermissionLevel = "none" | "view" | "edit"

interface Permissions {
  companies: PermissionLevel
  linking: PermissionLevel
  bankBalance: PermissionLevel
  sponsorshipTransfer: PermissionLevel
  visaIssuance: PermissionLevel
  annualRenewal: PermissionLevel
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (user: UserType) => void
  initialData?: UserType | null
}

export function AddUsersModal({ isOpen, onClose, onSave, initialData }: Props) {
  const isEditMode = !!initialData

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<Role>("مخصص")
  const [permissions, setPermissions] = useState<Permissions>({
    companies: "none",
    linking: "none",
    bankBalance: "none",
    sponsorshipTransfer: "none",
    visaIssuance: "none",
    annualRenewal: "none",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setName(initialData.name || "")
        setPhone("")

        if (initialData.role === "مدير" || (initialData as any).is_admin) {
          setRole("مدير")
        } else if (initialData.role === "مشرف") {
          setRole("مشرف")
        } else {
          setRole("مخصص")
        }

        if ((initialData as any).permissions) {
          setPermissions((initialData as any).permissions as Permissions)
        } else {
          setPermissions({
            companies: "none",
            linking: "none",
            bankBalance: "none",
            sponsorshipTransfer: "none",
            visaIssuance: "none",
            annualRenewal: "none",
          })
        }
      } else {
        setName("")
        setPhone("")
        setRole("مخصص")
        setPermissions({
          companies: "none",
          linking: "none",
          bankBalance: "none",
          sponsorshipTransfer: "none",
          visaIssuance: "none",
          annualRenewal: "none",
        })
      }
    }
  }, [isOpen, isEditMode, initialData])

  useEffect(() => {
    if (role === "مدير") {
      setPermissions({
        companies: "edit",
        linking: "edit",
        bankBalance: "edit",
        sponsorshipTransfer: "edit",
        visaIssuance: "edit",
        annualRenewal: "edit",
      })
    } else if (role === "مشرف") {
      setPermissions({
        companies: "edit",
        linking: "edit",
        bankBalance: "none",
        sponsorshipTransfer: "edit",
        visaIssuance: "edit",
        annualRenewal: "edit",
      })
    }
  }, [role])

  const isFormInvalid = useMemo(() => {
    if (!name.trim()) return true
    if (!isEditMode && !phone.trim()) return true
    if (role === "مخصص") {
      const hasAny = Object.values(permissions).some((p) => p !== "none")
      if (!hasAny) return true
    }
    return false
  }, [name, phone, isEditMode, role, permissions])

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      let user: UserType

      if (isEditMode && initialData) {
        user = await updateUser(initialData.id, {
          name: name.trim(),
          role,
          permissions,
        })
        toast.success("تم تعديل بيانات المستخدم")
      } else {
        const cleanPhone = phone.trim().replace(/\D/g, "")
        const fakeEmail = cleanPhone + "@Hashel.com"
        const password = cleanPhone.slice(-6) + "@Hs"

        user = await createUserWithPhone({
          name: name.trim(),
          email: fakeEmail,
          password,
          role,
          permissions,
        })
        toast.success(`تم إضافة المستخدم – كلمة المرور: ${password}`, {
          duration: 8000,
        })
      }

      onSave(user)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ")
    } finally {
      setIsSubmitting(false)
    }
  }

  const permissionToLabel = (level: PermissionLevel): string => {
    switch (level) {
      case "view":
        return "مشاهدة"
      case "edit":
        return "تعديل"
      default:
        return "ممنوع"
    }
  }

  const labelToPermission = (label: string): PermissionLevel => {
    if (label === "مشاهدة") return "view"
    if (label === "تعديل") return "edit"
    return "none"
  }

  const permissionFields: { key: keyof Permissions; label: string }[] = [
    { key: "companies", label: "التحكم في ملف الشركات" },
    { key: "linking", label: "التحكم في الربط بين الشركات" },
    { key: "bankBalance", label: "التحكم في الرصيد البنكي" },
    { key: "sponsorshipTransfer", label: "تعديل وإضافة نقل الكفالة" },
    { key: "visaIssuance", label: "تعديل وإضافة إصدار تأشيرة" },
    { key: "annualRenewal", label: "تعديل وإضافة التجديد سنوي" },
  ]

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
          <div>
            <Label text="اسم المستخدم" required />
            <Input
              value={name}
              onChange={setName}
              placeholder="أدخل الاسم الكامل..."
            />
          </div>

          {isEditMode ? (
            <div>
              <Label text="رقم الجوال" />
              <div className="flex h-12 items-center rounded-xl border border-input bg-muted/30 px-4 text-foreground">
                <Phone className="ml-2 h-4 w-4 text-muted-foreground" />
                <span>{initialData?.email}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                رقم الجوال غير قابل للتعديل
              </p>
            </div>
          ) : (
            <div>
              <Label text="رقم الجوال" required />
              <Input
                value={phone}
                onChange={setPhone}
                placeholder="05xxxxxxxx"
              />
              {/* <p className="mt-1 text-xs text-muted-foreground">
                سيتم إنشاء بريد إلكتروني تلقائي بصيغة الرقم@Hashel.com
              </p> */}
            </div>
          )}

          <div>
            <Label text="الدور" required />
            <Select
              value={role}
              onChange={(val) => setRole(val as Role)}
              options={["مدير", "مشرف", "مخصص"]}
              placeholder="اختر الدور"
            />
          </div>

          {role === "مخصص" && (
            <div>
              <Label text="الصلاحيات" required />
              <div className="space-y-3">
                {permissionFields.map((perm) => (
                  <div key={perm.key} className="flex items-center gap-2">
                    <span className="w-48 text-sm">{perm.label}</span>
                    <div className="flex-1">
                      <Select
                        value={permissionToLabel(permissions[perm.key])}
                        onChange={(val) =>
                          setPermissions((prev) => ({
                            ...prev,
                            [perm.key]: labelToPermission(val),
                          }))
                        }
                        options={["ممنوع", "تعديل"]}
                        placeholder="اختر"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
