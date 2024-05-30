'use client'

import { useFormStatus } from 'react-dom'

import { Button } from '~/components/ui/button'

export default function SignInBtn() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      Sign in
    </Button>
  )
}
