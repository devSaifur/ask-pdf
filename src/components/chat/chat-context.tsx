'use client'

import { useMutation } from '@tanstack/react-query'
import { createContext, useRef, useState } from 'react'

type StreamResponse = {
  addMessage: () => void
  message: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  isPending: boolean
}

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: '',
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {},
  isPending: false,
})

interface Props {
  children: React.ReactNode
  fileId: string
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState('')
  const backupMessage = useRef('')

  const { isPending, mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, message }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      return res.body
    },
    onMutate: ({ message }) => {
      backupMessage.current = message
      setMessage('')
    },
  })

  const addMessage = () => sendMessage({ message })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isPending }}
    >
      {children}
    </ChatContext.Provider>
  )
}
