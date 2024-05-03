import { Index } from '@upstash/vector'
import { env } from '~/env'

export const index = new Index({
  url: env.UPSTASH_VECTOR_REST_URL,
  token: env.UPSTASH_VECTOR_REST_TOKEN,
})
