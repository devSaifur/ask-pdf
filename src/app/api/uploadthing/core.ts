import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { type FileRouter, createUploadthing } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

import { PLANS } from '~/config/stripe'
import { env } from '~/env'
import getSession from '~/lib/auth/getSession'
import {
  addFile,
  getFileByKey,
  updateFileOnError,
  updateFileOnSuccess,
} from '~/lib/data/queries'
import { getUserSubscriptionPlan } from '~/lib/stripe'
import { index } from '~/lib/upstashVector'

const f = createUploadthing()

async function middleware() {
  const session = await getSession()

  if (!session?.user || !session.user.id) {
    throw new UploadThingError('Unauthorized')
  }

  console.log('session', session.user)

  const subscriptionPlan = await getUserSubscriptionPlan()

  console.log('subscriptionPlan', subscriptionPlan)

  return { userId: session.user.id, subscriptionPlan }
}

async function onUploadComplete({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    url: string
    key: string
    name: string
  }
}) {
  console.log('onUploadComplete', metadata, file)
  const isFileExists = await getFileByKey(file.key)

  if (isFileExists) return

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

    const pagesAmt = pageLevelDocs.length

    const { subscriptionPlan } = metadata

    const { isSubscribed } = subscriptionPlan

    const isProExceeded = pagesAmt > PLANS.find((p) => p.name === 'Pro')!.quota
    const isFreeExceeded =
      pagesAmt > PLANS.find((p) => p.name === 'Free')!.quota

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await updateFileOnError(createdFile.id)
    }

    // vector and index entire document

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: env.GOOGLE_API_KEY,
    })

    const UpstashVector = new UpstashVectorStore(embeddings, {
      index,
      namespace: createdFile.id,
    })

    await UpstashVector.addDocuments(pageLevelDocs)

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
}

export const ourFileRouter = {
  freePlanUploader: f(
    { pdf: { maxFileSize: '4MB' } },
    { awaitServerData: false },
  )
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f(
    { pdf: { maxFileSize: '16MB' } },
    { awaitServerData: false },
  )
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
