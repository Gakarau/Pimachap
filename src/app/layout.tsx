import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { BookingProvider } from '@/lib/booking-context'
import { ThemeProvider } from '@/lib/theme-context'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'PIMACHAP — Book Lab Tests in Kenya',
  description: 'Compare labs, book tests, and get a phlebotomist sent to your door. Transparent pricing across Nairobi.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <BookingProvider>
              <AppShell>{children}</AppShell>
            </BookingProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
