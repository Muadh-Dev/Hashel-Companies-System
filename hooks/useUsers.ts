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

// النوع بعد التعديل
export type User = {
  auth_id: string
  name: string
  email: string
  password: string
  is_admin: boolean
  role: "مدير" | "مشرف" | "مخصص" // حقل اختياري
  permissions: Permissions // حقل اختياري
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

  const updateUserLocal = useCallback((updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.auth_id === updatedUser.auth_id ? updatedUser : user
      )
    )
  }, [])

  const removeUserLocal = useCallback((auth_id: string) => {
    setUsers((prev) => prev.filter((user) => user.auth_id !== auth_id))
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
