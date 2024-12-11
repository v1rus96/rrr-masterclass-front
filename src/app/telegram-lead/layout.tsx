import { Inter } from 'next/font/google'
import Script from 'next/script'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
