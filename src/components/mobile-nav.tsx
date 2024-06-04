'use client'

import { ArrowRightIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from './ui/button'

export default function MobileNav({ isAuth }: { isAuth: boolean }) {
  const [isOpen, setOpen] = useState(false)

  const toggleOpen = () => setOpen((prev) => !prev)

  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) toggleOpen()
  }, [isOpen])

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen()
    }
  }

  return (
    <div className="sm:hidden">
      <HamburgerMenuIcon
        onClick={toggleOpen}
        className="relative z-50 size-5 text-zinc-700"
      />

      {isOpen && (
        <div className="fixed inset-0 z-0 w-full animate-in fade-in-20 slide-in-from-top-5">
          <ul className="absolute grid w-full gap-3 border-b border-zinc-200 bg-white px-10 pb-8 pt-20 shadow-xl">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent('/api/auth/sign-in')}
                    className="flex w-full items-center font-semibold text-green-600"
                    href="/api/auth/sign-in"
                  >
                    Sign in
                    <ArrowRightIcon className="ml-2 size-5" />
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => closeOnCurrent('/pricing')}
                    className="flex w-full items-center font-semibold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent('/dashboard')}
                    className="flex w-full items-center font-semibold"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Button
                    onClick={() => signOut()}
                    variant="destructive"
                    className="items-start font-semibold"
                  >
                    Sign out
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
