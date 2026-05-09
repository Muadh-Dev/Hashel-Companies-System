import { AuthGuard } from "@/components/AuthGuard"
import AppSidebar from "@/components/app-sidebar"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | نظام شركات هاشل اليامي",
    default: "نظام شركات هاشل اليامي",
  },
  description: "نظام متكامل لإدارة العمليات لشركات هاشل اليامي",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#3B82F6", // لون شريط الحالة في الهواتف
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <main className="flex h-screen flex-col overflow-hidden">
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <AppSidebar>{children}</AppSidebar>
        </div>
      </main>
    </AuthGuard>
  )
}
