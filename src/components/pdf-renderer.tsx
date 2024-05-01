'use client'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useResizeDetector } from 'react-resize-detector'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn } from '~/lib/utils'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString()

export default function PdfRenderer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>()
  const [currPage, setCurrPage] = useState(1)

  const PdfPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  })

  type TPdfPageValidator = z.infer<typeof PdfPageValidator>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TPdfPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(PdfPageValidator),
  })

  const handlePageSubmit = ({ page }: TPdfPageValidator) => {
    setCurrPage(Number(page))
    setValue('page', String(page))
  }

  const { ref, width } = useResizeDetector()

  return (
    <div className="flex w-full flex-col items-center rounded-md bg-white shadow">
      <div className="flex h-14 w-full items-center justify-between border-b border-zinc-200 px-2">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
            }}
            disabled={currPage <= 1}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDownIcon className="size-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register('page')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)()
                }
              }}
              className={cn(
                'h-8 w-14',
                errors.page && 'focus-visible:outline-red-500',
              )}
              type="number"
            />
            <p className="space-x-1 text-sm text-zinc-700">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          <Button
            onClick={() =>
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1,
              )
            }
            disabled={numPages === undefined || currPage === numPages}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronUpIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-screen w-full flex-1">
        <div ref={ref}>
          <Document
            file={url}
            loading={
              <div className="flex justify-center">
                <ReloadIcon className="my-24 size-6 animate-spin" />
              </div>
            }
            onLoadError={() => {
              toast.error('Something went wrong while loading the PDF')
            }}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="max-h-full"
          >
            <Page pageNumber={currPage} width={width ? width : 1} />
          </Document>
        </div>
      </div>
    </div>
  )
}
