import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import 'simplebar-react/dist/simplebar.min.css'
import { Toaster } from 'sonner'

import Navbar from '~/components/navbar'
import Providers from '~/components/providers'
import { cn, constructMetadata } from '~/lib/utils'

import './globals.css'

export const metadata: Metadata = constructMetadata()

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
