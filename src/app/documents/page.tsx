import Files from '~/components/files'
import UploadButton from '~/components/upload-button'
import { checkUser } from '~/lib/auth/checkUser'
import { getFiles } from '~/lib/data/queries'
import { redirect } from 'next/navigation'

export default async function Documents() {
  const user = await checkUser()

  if (!user || !user.id) {
    redirect('/sign-in?origin=documents')
  }

  const files = await getFiles(user.id)

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 text-5xl font-bold text-gray-900">My Files</h1>

        <UploadButton />
      </div>

      {/* Display all user files */}

      <Files files={files} />
    </main>
  )
}
