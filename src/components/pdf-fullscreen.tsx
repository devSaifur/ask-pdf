'use client'

import { EnterFullScreenIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import SimpleBar from 'simplebar-react'
import { toast } from 'sonner'

import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

export default function PdfFullscreen({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>()
  const [isOpen, setIsOpen] = useState(false)

  const { ref, width } = useResizeDetector()

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
        <Button
          variant="ghost"
          aria-label="toggle fullscreen"
          className="gap-1.5"
        >
          <EnterFullScreenIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-7xl">
        <SimpleBar autoHide={false} className="mt-6 max-h-[calc(100dvh-10rem)]">
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
              {new Array(numPages).fill(0).map((_, index) => (
                <Page
                  width={width ? width : 1}
                  key={index}
                  pageNumber={index + 1}
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  )
}
