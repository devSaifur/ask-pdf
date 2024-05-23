'use client'

import { ChevronLeftIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { getFileByIdAction } from '~/actions/fileActions'

import { buttonVariants } from '../ui/button'
import { Icons } from '../ui/icons'
import { ChatContextProvider } from './chat-context'
import ChatInput from './chat-input'
import Messages from './messages'

interface ChatWrapperProps {
  fileId: string
}

export default function ChatWrapper({ fileId }: ChatWrapperProps) {
  const { data: file } = useQuery({
    queryKey: ['file'],
    queryFn: () => getFileByIdAction(fileId),
    refetchInterval: ({ state }) =>
      state.data?.uploadStatus === 'success' ||
      state.data?.uploadStatus === 'failed'
        ? false
        : 500,
  })

  if (!file) return null

  const Loading = () => (
    <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
      <div className="mb-28 flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Icons.loader className="size-8 animate-spin text-blue-500" />
          <h3 className="text-xl font-semibold">Loading...</h3>
          <p className="text-sm text-zinc-500">
            We&apos;re preparing your PDF.
          </p>
        </div>
      </div>

      <ChatInput isDisabled />
    </div>
  )

  const Processing = () => (
    <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
      <div className="mb-28 flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Icons.loader className="size-8 animate-spin text-blue-500" />
          <h3 className="text-xl font-semibold">Processing PDF...</h3>
          <p className="text-sm text-zinc-500">This won&apos;t take long.</p>
        </div>
      </div>

      <ChatInput isDisabled />
    </div>
  )

  const Failed = () => (
    <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
      <div className="mb-28 flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <CrossCircledIcon className="size-8 text-red-500" />
          <h3 className="text-xl font-semibold">Too many pages in PDF</h3>
          {/* <p className='text-zinc-500 text-sm'>
          Your{' '}
          <span className='font-medium'>
            {isSubscribed ? 'Pro' : 'Free'}
          </span>{' '}
          plan supports up to{' '}
          {isSubscribed
            ? PLANS.find((p) => p.name === 'Pro')
                ?.pagesPerPdf
            : PLANS.find((p) => p.name === 'Free')
                ?.pagesPerPdf}{' '}
          pages per PDF.
        </p> */}
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: 'secondary',
              className: 'mt-4',
            })}
          >
            <ChevronLeftIcon className="mr-1.5 size-3" />
            Back
          </Link>
        </div>
      </div>

      <ChatInput isDisabled />
    </div>
  )

  const Success = () => (
    <ChatContextProvider fileId={file.id}>
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col justify-between">
          <Messages fileId={file.id} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  )

  if (file.uploadStatus === 'pending') return <Loading />
  if (file.uploadStatus === 'processing') return <Processing />
  if (file.uploadStatus === 'failed') return <Failed />
  if (file.uploadStatus === 'success') return <Success />
}
