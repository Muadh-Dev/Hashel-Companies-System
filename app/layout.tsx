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
    <html lang="ar" suppressHydrationWarning className={cn(tajawal.variable)}>
      <body>
        {/* <ThemeProvider> */}
        <TooltipProvider>
          <TitleBar />
          <main className="flex flex-1 flex-row overflow-hidden">
            <div className="flex-1 overflow-auto">{children}</div>
            <Layout />
          </main>
          <Toaster />
        </TooltipProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
