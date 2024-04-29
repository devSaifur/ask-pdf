'use client'

import { Button } from './ui/button'
import {
  ChatBubbleIcon,
  PlusIcon,
  ReloadIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteFileAction } from '~/actions/fileDeleteAction'
import { TFile } from '~/lib/db/schema'

export default function Files({ files }: { files: TFile[] }) {
  const router = useRouter()

  const { isPending, mutate: deleteFile } = useMutation({
    mutationFn: deleteFileAction,
    onSuccess: () => {
      router.refresh()
    },
    onError: () => {
      toast.error('Something went wrong while deleting the file')
    },
  })

  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <li
          key={file.id}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
        >
          <Link href={`/documents/${file.id}`} className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-between space-x-6 px-6 pt-6">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-lg font-medium text-zinc-900">
                    {file.name}
                  </h3>
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-4 grid grid-cols-3 place-items-center gap-6 px-6 py-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <PlusIcon className="size-4" />
              {format(new Date(file.createdAt), 'MMM yyy')}
            </div>

            <div className="flex items-center gap-2">
              <ChatBubbleIcon className="size-4" />
              mocked
            </div>

            <Button
              onClick={() => deleteFile(file.id)}
              size="sm"
              variant="destructive"
              className="opacity-75 transition-all hover:opacity-100"
              disabled={isPending}
            >
              {isPending ? (
                <ReloadIcon className="size-4 animate-spin" />
              ) : (
                <TrashIcon className="size-4" />
              )}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
