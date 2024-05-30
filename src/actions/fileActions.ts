'use server'

import 'server-only'

import getSession from '~/lib/auth/getSession'
import { deleteFile, getFileById, getFileByKey } from '~/lib/data/queries'

export async function getFileByKeyAction(key: string) {
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    return await getFileByKey({ key, userId: session.user.id })
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
  const session = await getSession()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  try {
    return await getFileById({ fileId: id, userId: session.user.id })
  } catch (err) {
    throw err
  }
}
