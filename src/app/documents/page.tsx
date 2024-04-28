import { PDFUploader } from '~/components/pdf-uploader'
import { checkUser } from '~/lib/auth/checkUser'
import { redirect } from 'next/navigation'

export default async function Documents() {
  const user = await checkUser()

  if (!user || !user.id) {
    redirect('/sign-in?origin=documents')
  }

  return (
    <main className="px-4">
      <PDFUploader className="mx-auto mt-32 max-w-4xl" />
    </main>
  )
}
