import {
  type GenerationConfig,
  GoogleGenerativeAI,
} from '@google/generative-ai'
import { env } from '~/env'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)

const gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
}

export async function runGemini(prompt: string) {
  const chatSession = gemini.startChat({
    generationConfig,
    history: [
      {
        role: 'user',
        parts: [
          {
            text: 'hello',
          },
        ],
      },
      {
        role: 'model',
        parts: [{ text: 'Hello! How can I help you today? \n' }],
      },
    ],
  })
  const result = await chatSession.sendMessage(prompt)
  const response = result.response.text()
  return response
}
