import { and, asc, desc, eq, sql } from 'drizzle-orm'
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
  return db.select().from(files).where(eq(files.createdById, userId))
}

export async function deleteFile(fileId: string) {
  await db.delete(files).where(eq(files.id, fileId))
}

export async function getFileById(fileId: string, userId: string) {
  return db.query.files.findFirst({
    where: and(eq(files.id, fileId), eq(files.createdById, userId)),
  })
}

export async function getFileByKey(key: string, userId: string) {
  return db.query.files.findFirst({
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
  return db.query.users.findFirst({ where: eq(users.id, userId) })
}

export async function checkFileExists(fileKey: string) {
  return db.query.files.findFirst({ where: eq(files.key, fileKey) })
}
