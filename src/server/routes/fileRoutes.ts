import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import z from 'zod'

import { INFINITE_QUERY_LIMIT } from '~/config'
import { getFileById, getFileByKey, getFileMessages } from '~/lib/data/queries'
import { getUser } from '~/server/getUser'
import { ENV } from '~/types'

export const fileRoutes = new Hono<ENV>()
  .get(
    '/file-message',
    zValidator(
      'query',
      z.object({
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    ),
    getUser,
    async (c) => {
      const { cursor, fileId } = c.req.valid('query')
      const userId = c.get('userId')

      const limit = INFINITE_QUERY_LIMIT

      const file = await getFileById(fileId, userId)

      if (!file) {
        return c.json({ error: 'File not found' }, 404)
      }

      const messages = await getFileMessages({
        fileId,
        limit: limit + 1,
        cursor: cursor ? cursor : undefined,
      })

      let nextCursor: typeof cursor | undefined = undefined

      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return c.json({ messages, nextCursor }, 200)
    },
  )
  .get(
    '/',
    zValidator(
      'query',
      z
        .object({
          fileId: z.string().optional(),
          fileKey: z.string().optional(),
        })
        .refine((data) => data.fileId || data.fileKey, {
          message: 'Either fileId or fileKey must be provided',
        }),
    ),
    getUser,
    async (c) => {
      const { fileId, fileKey } = c.req.valid('query')
      const userId = c.get('userId')

      let file

      if (fileId) {
        file = await getFileById(fileId, userId)
      } else if (fileKey) {
        file = await getFileByKey(fileKey)
      }

      if (!file) {
        return c.json({ error: 'File not found' }, 404)
      }

      return c.json(file, 200)
    },
  )
