import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { INFINITE_QUERY_LIMIT } from '~/config'
import { PLANS } from '~/config/stripe'
import { getFileById, getFileMessages, getUserById } from '~/lib/data/queries'
import { getUserSubscriptionPlan, stripe } from '~/lib/stripe'
import { absoluteUrl } from '~/lib/utils'

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

  getFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx
      const { fileId } = input

      const file = await getFileById({ fileId, userId })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      return file
    }),

  createStripeSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx

    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const dbUser = await getUserById(userId)

    if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' })

    const billingUrl = absoluteUrl('/documents/billing')

    const subscriptionPlan = await getUserSubscriptionPlan()

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      })
      return { url: stripeSession.url }
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === 'Pro')?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return { url: stripeSession.url }
  }),
})

export type AppRouter = typeof appRouter
