import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Sidebar } from "@/components/sidebar"
import SupabaseProvider from '@/components/providers/supabase-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-secondary/10 pb-10">
              {children}
            </main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
