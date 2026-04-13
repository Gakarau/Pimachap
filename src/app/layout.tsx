import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { BookingProvider } from '@/lib/booking-context'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'PIMACHAP — Book Lab Tests in Kenya',
  description: 'Compare labs, book tests, and get a phlebotomist sent to your door. Transparent pricing across Nairobi.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <BookingProvider>
            {/* Desktop top bar */}
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[var(--border)] sticky top-0 z-50">
              <div className="logo-text text-2xl">PIMA<span>CHAP</span></div>
              <nav className="flex items-center gap-8">
                <a href="/" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors">Home</a>
                <a href="/search" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors">Book Tests</a>
                <a href="/ready-sample" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors">Ready Sample</a>
                <a href="/track" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors">Track Order</a>
                <a href="/login" className="px-5 py-2.5 bg-[var(--teal)] text-white text-sm font-bold rounded-full hover:bg-[var(--teal-dark)] transition-colors no-underline">
                  Sign In
                </a>
              </nav>
            </header>

            {/* Main content */}
            <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 pb-24 md:pb-8">
              {children}
            </main>

            {/* Mobile bottom nav */}
            <BottomNav />
          </BookingProvider>
        </CartProvider>
      </body>
    </html>
  )
}
