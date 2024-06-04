import { notFound, redirect } from 'next/navigation'

import ChatWrapper from '~/components/chat/chat-wrapper'
import PdfRenderer from '~/components/pdf-renderer'
import getSession from '~/lib/auth/getSession'
import { getFileById } from '~/lib/data/queries'

export default async function Page({ params }: { params: { docId: string } }) {
  const { docId } = params

  const session = await getSession()

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/documents/${docId}`)
  }

  const file = await getFileById({ fileId: docId, userId: session.user.id })

  if (!file) {
    notFound()
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-1 flex-col justify-between">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-5 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className="flex-[0.75] shrink-0 border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={docId} />
        </div>
      </div>
    </div>
  )
}
