import type { Context, Next } from 'hono'

import getSession from '~/lib/auth/getSession'

export async function getUser(c: Context, next: Next) {
  const session = await getSession()
  const user = session?.user

  if (!user || !user.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('userId', user.id)
  c.set('user', user)

  return next()
}
