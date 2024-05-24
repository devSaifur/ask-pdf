import { UpstashVectorStore } from '@langchain/community/vectorstores/upstash'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai'
import type { NextRequest } from 'next/server'
import { env } from '~/env'
import { checkUser } from '~/lib/auth/checkUser'
import { createMessage, getFileById, getPrevMessage } from '~/lib/data/queries'
import { gemini } from '~/lib/gemini'
import { index } from '~/lib/upstashVector'
import { SendMessageValidator } from '~/lib/validators'

export async function POST(req: NextRequest) {
  const body = await req.json()

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

  const chat = gemini.startChat({
    history: [
      {
        role: 'user',
        parts: [
          {
            text: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer. Just help the user to the question related to the context, and you are unable to to answer outside of the context. 

            \n----------------\n

            PREVIOUS CONVERSATION: ${formattedPrevMessage.map((message) => {
              if (message.role === 'user') return `User: ${message.content}\n`
              return `Model: ${message.content}\n`
            })}
  
            \n----------------\n
  
            CONTEXT: ${results.map((r) => r.pageContent).join('\n\n')}
  
            USER INPUT: ${message}`,
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format.',
          },
        ],
      },
    ],
  })

  const response = await chat.sendMessageStream(message)

  const stream = GoogleGenerativeAIStream(response, {
    async onCompletion(response) {
      await createMessage({
        text: response,
        isUserMessage: false,
        userId: user.id,
        fileId,
      })
    },
  })

  return new StreamingTextResponse(stream)
}
