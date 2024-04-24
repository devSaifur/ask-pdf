import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from 'geist/font/sans'

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
      <body className={GeistSans.className}>{children}</body>
    </html>
  )
}
