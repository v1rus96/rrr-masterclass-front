import { Sidebar } from "@/components/sidebar"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="flex h-screen overflow-hidden">
      {/* <Sidebar /> */}
      <main className="flex-1 overflow-y-auto bg-secondary/10 pb-10">
        {children}
      </main>
    </div>
      </body>
    </html>
    
  )
}

