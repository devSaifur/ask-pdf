'use server'

import 'server-only'
import { checkUser } from '~/lib/auth/checkUser'
import { deleteFile, getFileById, getFileByKey } from '~/lib/data/queries'

export async function getFileByKeyAction(key: string) {
  const user = await checkUser()

  if (!user || !user.id) {
    throw new Error('Unauthorized')
  }

  try {
    return await getFileByKey({ key, userId: user.id })
  } catch (err) {
    throw err
  }
}

export async function deleteFileAction(id: string) {
  try {
    await deleteFile(id)
  } catch (err) {
    throw err
  }
}

export async function getFileByIdAction(id: string) {
  const user = await checkUser()

  if (!user || !user.id) {
    throw new Error('Unauthorized')
  }

  try {
    return await getFileById({ fileId: id, userId: user.id })
  } catch (err) {
    throw err
  }
}
