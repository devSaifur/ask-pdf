'use server'

import { and, asc, desc, eq, lte } from 'drizzle-orm'
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

export async function getPrevMessage(fileId: string, userId: string) {
  return await db
    .select()
    .from(messages)
    .where(and(eq(messages.fileId, fileId), eq(messages.userId, userId)))
    .limit(10)
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
  limit,
  cursor,
}: {
  fileId: string
  limit: number
  cursor?: number
}) {
  return await db
    .select({
      id: messages.id,
      text: messages.text,
      isUserMessage: messages.isUserMessage,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        eq(messages.fileId, fileId),
        cursor ? lte(messages.id, cursor) : undefined,
      ),
    )
    .limit(limit)
    .orderBy(desc(messages.id))
}
