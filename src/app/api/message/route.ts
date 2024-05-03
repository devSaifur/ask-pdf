import { NextRequest } from 'next/server'
import { checkUser } from '~/lib/auth/checkUser'
import { createMessage, getFileById } from '~/lib/data/queries'
import { SendMessageValidator } from '~/lib/validators'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // check user is authenticated or not

  const user = await checkUser()

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  const { message, fileId } = SendMessageValidator.parse(body)

  const file = await getFileById({ fileId, userId: user.id })

  if (!file) {
    return new Response(JSON.stringify({ error: 'File not found' }), {
      status: 404,
    })
  }

  await createMessage({
    text: message,
    isUserMessage: true,
    userId: user.id,
    fileId,
  })
}
