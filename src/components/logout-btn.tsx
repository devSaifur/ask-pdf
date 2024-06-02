'use client'

import { useFormStatus } from 'react-dom'

import { Button } from './ui/button'

export default function LogoutBtn() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
