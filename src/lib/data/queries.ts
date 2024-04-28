'use server'

import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { files } from '../db/schema'

export async function getFiles(userId: string) {
  return await db.query.files.findMany({ where: eq(files.createdById, userId) })
}

export async function deleteFile(fileId: number) {
  await db.delete(files).where(eq(files.id, fileId))
}
