import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { env } from '~/env'

import { db } from '../db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  adapter: DrizzleAdapter(db),
})
