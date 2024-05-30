import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { INFINITE_QUERY_LIMIT } from '~/config'
import { getFileById, getFileMessages } from '~/lib/data/queries'

import { protectedProcedure, router } from './trpc'

export const appRouter = router({
  getFileMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.coerce.number().nullish(),
        fileId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await getFileById({ fileId, userId })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

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

      return { messages, nextCursor }
    }),
})
export type AppRouter = typeof appRouter
