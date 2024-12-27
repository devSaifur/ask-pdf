'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/react-query'
import { SessionProvider } from 'next-auth/react'

import { trpc } from '~/app/_trpc/client'
import { getQueryClient } from '~/lib/get-query-client'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: absoluteUrl('/api/trpc'),
      }),
    ],
  })

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </trpc.Provider>
  )
}

function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}
