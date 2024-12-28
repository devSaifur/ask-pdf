'use client'

import { ArrowRightIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '~/lib/api-rpc'

import { Button } from './ui/button'

export default function UpgradeBtn() {
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
      window.location.href = url ?? '/documents/billing'
    },
  })

  return (
    <Button
      onClick={() => createStripeSession()}
      disabled={isPending}
      className="w-full"
    >
      Upgrade now <ArrowRightIcon className="ml-1.5 size-5" />
    </Button>
  )
}
