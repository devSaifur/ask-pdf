import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { getSession } from 'next-auth/react'
import { type FileRouter, createUploadthing } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

import { env } from '~/env'
import {
  addFile,
  updateFileOnError,
  updateFileOnSuccess,
} from '~/lib/data/queries'
import { index } from '~/lib/upstashVector'

const f = createUploadthing()

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(async () => {
      const session = await getSession()

      if (!session?.user || !session.user.id)
        throw new UploadThingError('Unauthorized')

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)

      console.log('file url', file.url)

      const createdFile = await addFile({
        name: file.name,
        url: file.url,
        key: file.key,
        createdById: metadata.userId,
        uploadStatus: 'processing',
      })

      try {
        const res = await fetch(file.url)
        const blob = await res.blob()

        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length // depending on page number do stuff on stripe

        // vector and index entire document

        const embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: env.GOOGLE_API_KEY,
        })

        const UpstashVector = new UpstashVectorStore(embeddings, { index })

        const documents = pageLevelDocs.map((doc) => {
          doc.metadata = { fileId: createdFile.id }
          return doc
        })

        await UpstashVector.addDocuments(documents)

        await updateFileOnSuccess(createdFile.id)

        return { uploadedBy: metadata.userId }
      } catch (err) {
        await updateFileOnError(createdFile.id)

        console.error({
          error: err,
          message: 'Something went wrong while processing the file',
        })
      }
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
