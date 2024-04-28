'use server'

import 'server-only'
import { deleteFile } from '~/lib/data/queries'

export async function deleteFileAction(id: number) {
  try {
    await deleteFile(id)
  } catch (err) {
    throw err
  }
}
