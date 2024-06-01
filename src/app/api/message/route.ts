import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { streamText } from 'ai'

import { env } from '~/env'
import { google } from '~/lib/ai'
import { auth } from '~/lib/auth'
import { createMessage, getFileById, getPrevMessage } from '~/lib/data/queries'
import { index } from '~/lib/upstashVector'
import { SendMessageValidator } from '~/lib/validators'

export const POST = auth(async function POST(req) {
  const body = await req.json()

  const user = req.auth?.user

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

  const UpstashVector = new UpstashVectorStore(embeddings, {
    index,
    namespace: fileId,
  })

  const results = await UpstashVector.similaritySearch(message, 4)

  const prevMessage = await getPrevMessage(fileId, user.id)

  const formattedPrevMessage = prevMessage.map((msg) => ({
    role: msg.isUserMessage ? 'user' : 'assistant',
    content: msg.text,
  }))

  const aiResponse = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    system: '',
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer unless it's just general greetings.
        
        \n----------------\n
  
        PREVIOUS CONVERSATION:
        ${formattedPrevMessage.map((message) => {
          if (message.role === 'user') return `User: ${message.content}\n`
          return `Assistant: ${message.content}\n`
        })}
  
        \n----------------\n
  
        CONTEXT:
        ${results.map((r) => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}
        `,
      },
    ],
    async onFinish({ text }) {
      await createMessage({
        text,
        isUserMessage: false,
        userId: user.id as string,
        fileId,
      })
    },
  })

  return aiResponse.toAIStreamResponse()
})
