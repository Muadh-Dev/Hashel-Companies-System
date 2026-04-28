import { AuthGuard } from "@/components/AuthGuard"
import AppSidebar from "@/components/app-sidebar"

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
