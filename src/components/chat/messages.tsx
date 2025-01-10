'use client'

import { EnvelopeOpenIcon } from '@radix-ui/react-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { Icons } from '~/components/ui/icons'
import { Skeleton } from '~/components/ui/skeleton'
import { useIntersection } from '~/hooks/use-intersection'
import { api } from '~/lib/api-rpc'

export default function Messages({ fileId }: { fileId: string }) {
  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['file', fileId],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const res = await api.file['file-message'].$get({
        query: {
          fileId,
          cursor: pageParam ? String(pageParam) : undefined,
        },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch file')
      }
      return res.json()
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: undefined,
  })

  const messages = data?.pages.flatMap((page) => page.messages)

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: 'loading-message',
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Icons.loader className="size-4 animate-spin" />
      </span>
    ),
  }

  const lastMessageRef = useRef<HTMLDivElement>(null)

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  })

  // useEffect(() => {
  //   if (entry?.isIntersecting) {
  //     fetchNextPage()
  //   }
  // }, [entry, fetchNextPage])

  return (
    <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex max-h-[calc(100dvh-3.5rem-7rem)] flex-1 flex-col-reverse gap-4 overflow-y-auto border-zinc-200 p-3">
      {isLoading ? (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <EnvelopeOpenIcon className="size-8 text-blue-500" />
          <h3 className="text-xl font-semibold">You&apos;re all set!</h3>
          <p className="text-sm text-zinc-500">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  )
}
