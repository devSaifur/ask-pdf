import { inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '~/server/index'

type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput['getFileMessages']['messages']

type OmitId = Omit<Messages[number], 'id'>

type OmitText = Omit<Messages[number], 'text'>

type ExtendedText = {
  text: string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText & ExtendedId