// app/layout.tsx
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import TitleBar from "@/components/TitleBar"
import OfflineGuard from "@/components/OfflineGuard" // استيراد المراقب
import localFont from "next/font/local"
import type { Metadata, Viewport } from "next"

const tajawal = localFont({
  src: [
    { path: "./_fonts/Tajawal-Regular.ttf", weight: "400" },
    { path: "./_fonts/Tajawal-Medium.ttf", weight: "500" },
    { path: "./_fonts/Tajawal-Bold.ttf", weight: "700" },
  ],
})

export const metadata: Metadata = {
  title: {
    template: "%s | نظام شركات هاشل اليامي",
    default: "نظام شركات هاشل اليامي",
  },
  description: "نظام متكامل لإدارة العمليات لشركات هاشل اليامي",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#3B82F6",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" suppressHydrationWarning className="no-scrollbar">
      <body className={tajawal.className}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <OfflineGuard /> {/* هنا يتم مراقبة الاتصال */}
              <TitleBar />
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
