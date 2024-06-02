'use client'

import { ArrowRightIcon } from '@radix-ui/react-icons'

import { trpc } from '~/app/_trpc/client'

import { Button } from './ui/button'

export default function UpgradeBtn() {
  const { mutate: createStripeSession, isPending } =
    trpc.createStripeSession.useMutation({
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
