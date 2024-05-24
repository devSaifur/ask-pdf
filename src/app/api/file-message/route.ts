import { NextRequest } from 'next/server'
import { INFINITE_QUERY_LIMIT } from '~/config'
import { checkUser } from '~/lib/auth/checkUser'
import { getFileById, getFileMessages } from '~/lib/data/queries'
import { FileMessagesValidator } from '~/lib/validators'

export async function POST(req: NextRequest) {
  const user = await checkUser()

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  const body = await req.json()

  const { fileId, limit } = FileMessagesValidator.parse(body)

  try {
    const file = await getFileById({ fileId, userId: user.id })

    if (!file) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
      })
    }

    const cursor = Number(req.nextUrl.searchParams.get('cursor'))

    const ensureLimit = limit ? limit : INFINITE_QUERY_LIMIT

    const messages = await getFileMessages({
      fileId,
      limit: ensureLimit + 1,
      cursor,
    })

    console.log({ messages })

    let nextCursor: typeof cursor | undefined = undefined

    if (messages.length > ensureLimit) {
      const nextItem = messages.shift()
      console.log({ nextItem })
      nextCursor = nextItem?.id
    }
    return new Response(JSON.stringify({ messages, nextCursor }), {
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
    })
  }
}
