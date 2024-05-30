import { signIn } from '~/lib/auth'

import SignInBtn from './sign-in-btn'

export default function SignInPage() {
  return (
    <div>
      <form
        action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/' })
        }}
      ></form>
      <SignInBtn />
    </div>
  )
}
