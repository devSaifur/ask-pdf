import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { connection } from 'next/server'
import { Suspense } from 'react'
import 'simplebar-react/dist/simplebar.min.css'
import { Toaster } from 'sonner'

import Navbar from '~/components/navbar'
import Providers from '~/components/providers'
import { cn, constructMetadata } from '~/lib/utils'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = constructMetadata()

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await connection()

  return (
    <html lang="en">
      <Providers>
        <body
          className={cn('grainy min-h-screen antialiased', geistSans.variable)}
        >
          <Toaster richColors />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
