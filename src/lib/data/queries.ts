import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache'
import 'server-only'

import { db } from '../db'
import {
  TFileInsert,
  TMessageInsert,
  files,
  messages,
  users,
} from '../db/schema'

export async function getFiles(userId: string) {
  'use cache'
  cacheTag('files')
  return db.select().from(files).where(eq(files.createdById, userId))
}

export async function deleteFile(fileId: string) {
  revalidateTag('files')
  await db.delete(files).where(eq(files.id, fileId))
}

export async function getFileById(fileId: string, userId: string) {
  'use cache'
  cacheTag('file', fileId)
  return db.query.files.findFirst({
    where: and(eq(files.id, fileId), eq(files.createdById, userId)),
  })
}

export async function getFileByKey(key: string) {
  'use cache'
  cacheTag('file', key)
  return db.query.files.findFirst({
    where: eq(files.key, key),
  })
}

export async function addFile(file: TFileInsert) {
  return (await db.insert(files).values(file).returning()).at(0)
}

export async function createMessage(value: TMessageInsert) {
  await db.insert(messages).values(value)
}

export async function getPrevMessage(fileId: string, userId: string) {
  'use cache'
  cacheTag('message', fileId)
  return db
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
  cursor?: string
}) {
  const cursorMessage = cursor
    ? await db.query.messages.findFirst({ where: eq(messages.id, cursor) })
    : null

  return db
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
        cursorMessage
          ? sql`(${messages.createdAt} <= ${cursorMessage.createdAt})`
          : undefined,
      ),
    )
    .limit(limit)
    .orderBy(desc(messages.createdAt))
}

export async function getUserById(userId: string) {
  'use cache'
  cacheTag('user')
  return db.query.users.findFirst({ where: eq(users.id, userId) })
}
