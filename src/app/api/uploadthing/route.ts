import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from './core'

export const handler = createRouteHandler({ router: ourFileRouter })
