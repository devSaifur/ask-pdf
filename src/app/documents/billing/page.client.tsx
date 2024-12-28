'use client'

import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Icons } from '~/components/ui/icons'
import MaxWidthWrapper from '~/components/ui/max-width-wrapper'
import { api } from '~/lib/api-rpc'
import type { getUserSubscriptionPlan } from '~/lib/stripe'

interface BillingClientPageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

export default function BillingClientPage({
  subscriptionPlan,
}: BillingClientPageProps) {
  const { mutate: createStripeSession, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.payment['create-checkout-session'].$post()
      if (!res.ok) {
        toast.error('Failed to create checkout session')
        throw new Error('Failed to create checkout session')
      }
      return res.json()
    },
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault()
          createStripeSession()
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong>{' '}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isPending ? (
                <Icons.loader className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to PRO'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on'}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
}
