import type { Metadata } from 'next'
import './globals.css'
import Navbar from '~/components/navbar'
import Providers from '~/components/providers'
import { cn } from '~/lib/utils'
import { GeistSans } from 'geist/font/sans'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Ask PDF',
  description: 'Ask your pdf questions and get answers with the power of AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className={cn('grainy min-h-screen antialiased', GeistSans.className)}
        >
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
