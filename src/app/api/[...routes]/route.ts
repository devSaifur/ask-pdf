import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import { fileRoutes } from '~/server/routes/fileRoutes'
import { paymentRoutes } from '~/server/routes/paymentRoutes'

const api = new Hono()
  .basePath('/api')
  .route('/file', fileRoutes)
  .route('/payment', paymentRoutes)

export const GET = handle(api)
export const POST = handle(api)

export type Api = typeof api
