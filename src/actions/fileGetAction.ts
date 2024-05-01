'use server'

import 'server-only'
import { checkUser } from '~/lib/auth/checkUser'
import { getFileByUrl } from '~/lib/data/queries'

export async function getFileAction(key: string) {
  const user = await checkUser()

  if (!user || !user.id) {
    throw new Error('Unauthorized')
  }

  try {
    return await getFileByUrl({ key, userId: user.id })
  } catch (err) {
    throw err
  }
}
