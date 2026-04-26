import { Tajawal } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import Layout from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import TitleBar from "@/components/TitleBar"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal", // هذا الاسم سنستخدمه في Tailwind
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" suppressHydrationWarning className={"no-scrollbar"}>
      <body>
        {/* <ThemeProvider> */}
        <TooltipProvider>
          <main className="flex h-screen flex-col overflow-hidden">
            <TitleBar />
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <Layout>{children}</Layout>
            </div>
          </main>
          <Toaster />
        </TooltipProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
