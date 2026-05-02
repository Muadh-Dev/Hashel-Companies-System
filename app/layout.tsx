// app/layout.tsx
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import TitleBar from "@/components/TitleBar"
import localFont from "next/font/local"

const tajawal = localFont({
  src: [
    { path: "../public/fonts/tajawal-regular.ttf", weight: "400" },
    { path: "../public/fonts/tajawal-medium.ttf", weight: "500" },
    { path: "../public/fonts/tajawal-bold.ttf", weight: "700" },
  ],
})

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
