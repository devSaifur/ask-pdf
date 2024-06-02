'use client'

import { ArrowRightIcon } from '@radix-ui/react-icons'

import { Button } from './ui/button'

export default function UpgradeBtn() {
  return (
    <Button onClick={() => {}} className="w-full">
      Upgrade now <ArrowRightIcon className="ml-1.5 size-5" />
    </Button>
  )
}
