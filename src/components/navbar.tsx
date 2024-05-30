import Link from 'next/link'

import SignInBtn from '~/app/(auth)/sign-in/sign-in-btn'
import { signIn } from '~/lib/auth'

import { buttonVariants } from './ui/button'
import MaxWidthWrapper from './ui/max-width-wrapper'

export default async function Navbar() {
  return (
    <nav className="sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="z-40 flex font-semibold">
            Ask PDF
          </Link>

          {/* Todo: Add mobile menu */}

          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: 'ghost' })}
              >
                Pricing
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signIn('google', { redirectTo: '/' })
                }}
              >
                <SignInBtn />
              </form>
              <Link
                href="/documents"
                className={buttonVariants({ variant: 'default' })}
              >
                Get Started
              </Link>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}
