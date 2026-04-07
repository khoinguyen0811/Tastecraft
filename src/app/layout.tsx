import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: '700' })

export const metadata: Metadata = {
  title: 'Bếp Nhà Làm',
  description: 'Nâng tầm nghệ thuật nấu ăn tại nhà',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="bg-[#f8f7f5] text-[#2d2d2d] min-h-screen flex flex-col">
        <NextTopLoader color="#f97316" height={3} showSpinner={false} shadow={false} />
        <Header />
        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-[1200px]">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}
