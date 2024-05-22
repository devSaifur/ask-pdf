import {
  type GenerationConfig,
  GoogleGenerativeAI,
} from '@google/generative-ai'
import { env } from '~/env'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)

const generationConfig: GenerationConfig = {
  maxOutputTokens: 100,
  responseMimeType: 'text/plain',
}

export const gemini = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest',
  generationConfig,
})
