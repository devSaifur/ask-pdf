import Link from 'next/link'
import { Suspense } from 'react'

import getSession from '~/lib/auth/getSession'

import AccountNav from './account-nav'
import MobileNav from './mobile-nav'
import { buttonVariants } from './ui/button'
import MaxWidthWrapper from './ui/max-width-wrapper'

export default function Navbar() {
  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            Ask PDF
          </Link>

          <Suspense fallback={<div>Loading...</div>}>
            <DynamicNav />
          </Suspense>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

async function DynamicNav() {
  const session = await getSession()
  const user = session?.user

  return (
    <>
      <MobileNav isAuth={!!user} />

      <div className="hidden items-center space-x-4 sm:flex">
        {!user ? (
          <>
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: 'ghost',
              })}
            >
              Pricing
            </Link>
            <Link
              className={buttonVariants({
                variant: 'ghost',
              })}
              href="/api/auth/signin?callbackUrl=/documents"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/documents"
              className={buttonVariants({
                variant: 'ghost',
              })}
            >
              Documents
            </Link>
            <AccountNav
              name={user.name || 'Your Account'}
              email={user.email ?? ''}
              imageUrl={user.image ?? ''}
            />
          </>
        )}
      </div>
    </>
  )
}
