import { TRPCError, initTRPC } from '@trpc/server'

import getSession from '~/lib/auth/getSession'

const t = initTRPC.create()

const isAuth = t.middleware(async ({ next }) => {
  const session = await getSession()

  if (!session?.user || !session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuth)
