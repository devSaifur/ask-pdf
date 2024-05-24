import { z } from 'zod'

export const SendMessageValidator = z.object({
  message: z.string().min(1),
  fileId: z.string().min(1),
})

export type TSendMessageValidator = z.infer<typeof SendMessageValidator>

export const FileMessagesValidator = z.object({
  limit: z.number().min(1).max(100).nullish(),
  fileId: z.string().min(1),
})

export type TFileMessagesValidator = z.infer<typeof FileMessagesValidator>
