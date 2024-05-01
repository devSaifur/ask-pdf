import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { checkUser } from '~/lib/auth/checkUser'
import { addFile } from '~/lib/data/queries'

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

      try {
        await addFile({
          name: file.name,
          url: file.url,
          key: file.key,
          createdById: metadata.userId,
          uploadStatus: 'processing',
        })

        return { uploadedBy: metadata.userId }
      } catch (err) {
        throw new UploadThingError('Failed to add file')
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
