import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import type { NextRequest } from 'next/server'
import { env } from '~/env'
import { checkUser } from '~/lib/auth/checkUser'
import { createMessage, getFileById, getPrevMessage } from '~/lib/data/queries'
import { index } from '~/lib/upstashVector'
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

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: env.GOOGLE_API_KEY,
  })

  const UpstashVector = new UpstashVectorStore(embeddings, { index })

  const results = await UpstashVector.similaritySearch(message, 4)

  const prevMessage = await getPrevMessage(fileId)

  const formattedPrevMessage = prevMessage.map((msg) => ({
    role: msg.isUserMessage ? 'user' : 'assistant',
    content: msg.text,
  }))
}
