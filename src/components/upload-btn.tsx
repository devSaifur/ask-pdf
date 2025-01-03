'use client'

import { FileIcon, UploadIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Dropzone from 'react-dropzone'
import { toast } from 'sonner'

import { api } from '~/lib/api-rpc'
import { useUploadThing } from '~/lib/uploadthing'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Icons } from './ui/icons'
import { Progress } from './ui/progress'

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { startUpload } = useUploadThing(
    isSubscribed ? 'proPlanUploader' : 'freePlanUploader',
  )

  const { mutate: startPooling } = useMutation({
    mutationKey: ['upload'],
    mutationFn: async (fileKey: string) => {
      const res = await api.file.$get({
        query: {
          fileKey,
        },
      })
      if (!res.ok) {
        throw new Error('Failed to fetch file')
      }
      return res.json()
    },
    retry: true,
    retryDelay: 1000,
    onSuccess: (file) => {
      if (!file)
        return toast.error('Something went wrong while uploading the file')

      router.push(`/documents/${file.id}`)
    },
    onError: () => {
      toast.error('Something went wrong while uploading the file')
    },
  })

  const startSimulatedProgress = () => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval)
          return prevProgress
        }
        return prevProgress + 10
      })
    }, 500)

    return interval
  }

  return (
    <Dropzone
      multiple={false}
      accept={{
        'application/pdf': ['.pdf'],
      }}
      maxFiles={1}
      onDrop={async (acceptedFile) => {
        setIsUploading(true)

        const progressInterval = startSimulatedProgress()

        // handle file uploading
        const res = await startUpload(acceptedFile)

        if (!res) {
          setIsUploading(false)
          return toast.error('Something went wrong while uploading the file')
        }

        const [{ key }] = res

        if (!key) {
          return toast.error('Something went wrong while uploading the file')
        }

        clearInterval(progressInterval)
        setUploadProgress(100)

        startPooling(key)
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="h-64 rounded-lg border border-dashed border-gray-300"
        >
          <div className="flex h-full w-full items-center justify-center">
            <label
              htmlFor="dropzone-file"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <UploadIcon className="mb-2 size-6 text-zinc-500" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? '16MB' : '4MB'})
                </p>
              </div>

              {acceptedFiles && acceptedFiles.length > 0 && (
                <div className="flex max-w-xs items-center divide-x divide-zinc-200 overflow-hidden rounded-md bg-white outline outline-[1px] outline-zinc-200">
                  <div className="grid h-full place-items-center px-3 py-2">
                    <FileIcon className="size-4 text-blue-500" />
                  </div>
                  <div className="h-full truncate px-3 py-2 text-sm">
                    {acceptedFiles.at(0)?.name}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mx-auto mt-4 w-full max-w-xs">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                    colorIndicator={
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }
                  />
                  {uploadProgress === 100 && (
                    <div className="flex items-center justify-center gap-1 pt-2 text-center text-sm text-zinc-700">
                      <Icons.loader className="size-3 animate-spin" />{' '}
                      Redirecting, please wait...
                    </div>
                  )}
                </div>
              )}

              <input {...getInputProps()} />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default function UploadBtn({ isSubscribed }: { isSubscribed: boolean }) {
  return (
    <Dialog>
      <DialogTitle aria-label="Upload a PDF" className="sr-only">
        Upload a PDF
      </DialogTitle>
      <DialogTrigger asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  )
}
