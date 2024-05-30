'use client'

import { FileIcon, UploadIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Dropzone from 'react-dropzone'
import { toast } from 'sonner'

import { getFileByKeyAction } from '~/actions/fileActions'
import { useUploadThing } from '~/lib/uploadthing'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Icons } from './ui/icons'
import { Progress } from './ui/progress'

const UploadDropzone = () => {
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { startUpload } = useUploadThing('pdfUploader')

  const { mutate: startPooling } = useMutation({
    mutationKey: ['upload'],
    mutationFn: getFileByKeyAction,
    retry: true,
    retryDelay: 1000,
    onSuccess: (file) => {
      if (!file) return toast.error('Its a fucking success error')

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

        const [fileResponse] = res

        const key = fileResponse.key

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
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
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
                      Redirecting..
                    </div>
                  )}
                </div>
              )}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default function UploadButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(visible) => {
        if (!visible) {
          setIsOpen(visible)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  )
}
