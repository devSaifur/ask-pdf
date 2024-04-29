'use server'

import { db } from '../db'
import { files } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import 'server-only'

export async function getFiles(userId: string) {
  return await db.query.files.findMany({ where: eq(files.createdById, userId) })
}

export async function deleteFile(fileId: number) {
  await db.delete(files).where(eq(files.id, fileId))
}

export async function getFileById({
  fileId,
  userId,
}: {
  fileId: number
  userId: string
}) {
  return db.query.files.findFirst({
    where: and(eq(files.id, fileId), eq(files.createdById, userId)),
  })
}
