'use server'

import 'server-only'

import getSession from '~/lib/auth/getSession'
import { deleteFile, getFileByKey } from '~/lib/data/queries'

export async function deleteFileAction(id: string) {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    await deleteFile(id)
  } catch (err) {
    throw err
  }
}
