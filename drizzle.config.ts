import { defineConfig } from 'drizzle-kit'

import { env } from '~/env'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
})
