'use client'

import { useMutation } from '@tanstack/react-query'
import { createContext, useRef, useState } from 'react'
import { toast } from 'sonner'

import { trpc } from '~/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '~/config'
import { generateId } from '~/lib/id'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {},
  isLoading: false,
})

interface Props {
  children: React.ReactNode
  fileId: string
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const backupMessage = useRef('')

  const utils = trpc.useUtils()

  const { mutate: sendMessage } = useMutation({
    mutationKey: ['SendMessage'],
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ fileId, message }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      return res.body
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message
      setMessage('')

      await utils.getFileMessages.cancel()

      const prevMessages = utils.getFileMessages.getInfiniteData()

      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINITE_QUERY_LIMIT,
        },
        (oldData) => {
          if (!oldData)
            return {
              pages: [],
              pageParams: [],
            }

          let newPages = [...oldData.pages]

          let latestPage = newPages[0]

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: generateId(),
              isUserMessage: true,
              text: message,
            },
            ...latestPage.messages,
          ]

          newPages[0] = latestPage

          return {
            ...oldData,
            pages: newPages,
          }
        },
      )

      setIsLoading(true)

      return {
        previousMessages: prevMessages?.pages.flatMap(
          (page) => page.messages ?? [],
        ),
      }
    },
    onSuccess: async (stream) => {
      setIsLoading(false)

      if (!stream) {
        return toast.error('Something went wrong while sending the message', {
          description: 'Please refresh the page and try again.',
        })
      }
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false

      let accResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()

        done = doneReading
        
        const chunk = decoder.decode(value)

        accResponse += chunk

        // Incrementally update the AI response
        utils.getFileMessages.setInfiniteData(
          {
            fileId,
            limit: INFINITE_QUERY_LIMIT,
          },
          (oldData) => {
            if (!oldData)
              return {
                pages: [],
                pageParams: [],
              }

            let updatedPages = oldData.pages.map((page) => {
              if (page === oldData.pages[0]) {
                let updatedMessages = page.messages.some(
                  (msg) => msg.id === 'ai-response',
                )
                  ? page.messages.map((msg) =>
                      msg.id === 'ai-response'
                        ? { ...msg, text: accResponse }
                        : msg,
                    )
                  : [
                      {
                        createdAt: new Date().toISOString(),
                        id: 'ai-response',
                        isUserMessage: false,
                        text: accResponse,
                      },
                      ...page.messages,
                    ]

                return {
                  ...page,
                  messages: updatedMessages,
                }
              }
              return page
            })

            return {
              ...oldData,
              pages: updatedPages,
            }
          },
        )
      }
    },
    onError: (_, __, ctx) => {
      setMessage(backupMessage.current)
      utils.getFileMessages.setData(
        { fileId },
        { messages: ctx?.previousMessages ?? [] },
      )
    },
    onSettled: async () => {
      setIsLoading(false)

      await utils.getFileMessages.invalidate({ fileId })
    },
  })

  const addMessage = () => sendMessage({ message })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  )
}
