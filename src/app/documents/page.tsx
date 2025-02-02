import { redirect } from 'next/navigation'

import Files from '~/components/files'
import UploadBtn from '~/components/upload-btn'
import getSession from '~/lib/auth/getSession'
import { getFiles } from '~/lib/data/queries'
import { getUserSubscriptionPlan } from '~/lib/stripe'

const SIGN_IN_URL = '/api/auth/signin?callbackUrl=/documents'

export default async function Documents() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect(SIGN_IN_URL)
  }

  const subscriptionPlan = await getUserSubscriptionPlan()
  const files = await getFiles(session.user.id)

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 text-5xl font-bold text-gray-900">My Files</h1>

        <UploadBtn isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* Display all user files */}

      <Files files={files} />
    </main>
  )
}
