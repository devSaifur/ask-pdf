'use server'

import { and, asc, eq, gt } from 'drizzle-orm'
import 'server-only'

import { db } from '../db'
import { TFileInsert, TMessageInsert, files, messages } from '../db/schema'

export async function getFiles(userId: string) {
  return await db.select().from(files).where(eq(files.createdById, userId))
}

export async function deleteFile(fileId: string) {
  await db.delete(files).where(eq(files.id, fileId))
}

export async function getFileById({
  fileId,
  userId,
}: {
  fileId: string
  userId: string
}) {
  return db.query.files.findFirst({
    where: and(eq(files.id, fileId), eq(files.createdById, userId)),
  })
}

export async function getFileByKey({
  key,
  userId,
}: {
  key: string
  userId: string
}) {
  return await db.query.files.findFirst({
    where: and(eq(files.key, key), eq(files.createdById, userId)),
  })
}

export async function addFile(file: TFileInsert) {
  const [createdFile] = await db.insert(files).values(file).returning()
  return createdFile
}

export async function createMessage(value: TMessageInsert) {
  await db.insert(messages).values(value)
}

export async function getPrevMessage(fileId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.fileId, fileId))
    .limit(6)
    .orderBy(asc(messages.createdAt))
}

export async function updateFileOnSuccess(fileId: string) {
  await db
    .update(files)
    .set({ uploadStatus: 'success' })
    .where(eq(files.id, fileId))
}

export async function updateFileOnError(fileId: string) {
  await db
    .update(files)
    .set({ uploadStatus: 'failed' })
    .where(eq(files.id, fileId))
}

export async function getFileMessages({
  fileId,
  cursor,
  limit,
}: {
  fileId: string
  cursor?: string | null
  limit?: number
}) {
  return await db.query.messages.findMany({
    where: and(
      eq(messages.fileId, fileId),
      cursor ? gt(messages.id, cursor) : undefined,
    ),
    orderBy: asc(messages.createdAt),
    columns: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
    limit,
  })
}
