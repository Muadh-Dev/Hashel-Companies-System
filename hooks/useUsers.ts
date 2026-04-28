"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { toast } from "sonner"

export type User = {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    // 🟢 استخدام الاسم الصحيح للجدول (كما أنشأته في SQL)
    const { data, error } = await supabase
      .from("Users") // أو "users" حسب ما يظهر في Supabase
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
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    )
  }, [])

  const removeUserLocal = useCallback((id: string) => {
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
