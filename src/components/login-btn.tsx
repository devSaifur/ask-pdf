'use client'

import { useFormStatus } from 'react-dom'

import { Button } from '~/components/ui/button'

export default function LoginBtn() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  )
}
