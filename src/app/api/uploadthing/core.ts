import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { env } from '~/env'
import { checkUser } from '~/lib/auth/checkUser'
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
      const user = await checkUser()

      if (!user?.id) throw new UploadThingError('Unauthorized')

      return { userId: user.id }
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

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: env.OPENAI_API_KEY,
        })

        const UpstashVector = new UpstashVectorStore(embeddings, { index })

        await UpstashVector.addDocuments(pageLevelDocs).catch((err) => {
          console.error(err)
          console.log({ error: 'Something went wrong while indexing the file' })
        })

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
