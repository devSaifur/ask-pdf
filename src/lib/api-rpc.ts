import { hc } from 'hono/client'

import { Api } from '~/app/api/[...routes]/route'

export const api = hc<Api>('/').api