import { PersonIcon, SketchLogoIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import Link from 'next/link'

import { signOut } from '~/lib/auth'
import { getUserSubscriptionPlan } from '~/lib/stripe'

import LogoutBtn from './logout-btn'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface AccountNavProps {
  name: string
  email: string
  imageUrl: string
}

export default async function AccountNav({
  name,
  email,
  imageUrl,
}: AccountNavProps) {
  const subscriptionPlan = await getUserSubscriptionPlan()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="aspect-square h-8 w-8 rounded-full bg-slate-400">
          <Avatar className="relative h-8 w-8">
            {imageUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  src={imageUrl}
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <PersonIcon className="size-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="text-sm font-medium text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/documents" className="cursor-pointer">
            Documents
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing" className="cursor-pointer">
              Manage Subscription
            </Link>
          ) : (
            <Link href="/pricing" className="cursor-pointer">
              Upgrade <SketchLogoIcon className="ml-1.5 size-4 text-blue-600" />
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <LogoutBtn />
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
