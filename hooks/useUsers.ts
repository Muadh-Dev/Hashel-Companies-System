"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

// الأنواع المضافة للصلاحيات
type PermissionLevel = "none" | "view" | "edit"

interface Permissions {
  companies: PermissionLevel
  linking: PermissionLevel
  bankBalance: PermissionLevel
  sponsorshipTransfer: PermissionLevel
  visaIssuance: PermissionLevel
  annualRenewal: PermissionLevel
}

export type User = {
  id: number // المعرف الأساسي في قاعدة البيانات
  auth_id: string
  name: string
  email: string
  password: string
  is_admin: boolean
  role: "مدير" | "مشرف" | "مخصص"
  permissions: Permissions
  created_at: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("خطأ في جلب بيانات المستخدمين:", error)
      toast.error("خطأ في جلب بيانات المستخدمين", { position: "top-center" })
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUserLocal = useCallback((newUser: User) => {
    setUsers((prev) => [newUser, ...prev])
  }, [])

  // التعديل هنا: نستخدم id للمقارنة وتحديث المصفوفة محلياً
  const updateUserLocal = useCallback((updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    )
  }, [])

  // التعديل هنا: نستخدم id لحذف المستخدم من المصفوفة محلياً
  const removeUserLocal = useCallback((id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }, [])

  return {
    users,
    loading,
    addUserLocal,
    updateUserLocal,
    removeUserLocal,
    refetch: fetchUsers,
  }
}
