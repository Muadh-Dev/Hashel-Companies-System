"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OfflineGuard() {
  const router = useRouter()

  useEffect(() => {
    // 1. تسجيل الـ Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => console.log("SW registered: ", registration.scope),
          (err) => console.log("SW registration failed: ", err)
        )
      })
    }

    // 2. مراقبة حالة الاتصال
    const handleOffline = () => router.push("/offline")
    if (typeof window !== "undefined" && !navigator.onLine) {
      handleOffline()
    }

    window.addEventListener("offline", handleOffline)
    return () => window.removeEventListener("offline", handleOffline)
  }, [router])

  return null
}
