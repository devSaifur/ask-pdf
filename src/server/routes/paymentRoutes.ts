import { Hono } from 'hono'

import { PLANS } from '~/config/stripe'
import { getUserById } from '~/lib/data/queries'
import { getUserSubscriptionPlan, stripe } from '~/lib/stripe'
import { absoluteUrl } from '~/lib/utils'
import { ENV } from '~/types'

import { getUser } from '../getUser'

export const paymentRoutes = new Hono<ENV>().post(
  '/create-checkout-session',
  getUser,
  async (c) => {
    const userId = c.get('userId')

    const dbUser = await getUserById(userId)

    if (!dbUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    const billingUrl = absoluteUrl('/documents/billing')

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      })
      return c.json({ url: stripeSession.url })
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

    if (!stripeSession.url) {
      return c.json({ error: 'Something went wrong' }, 500)
    }

    return c.json({ url: stripeSession.url })
  },
)
