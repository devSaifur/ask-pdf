import { PersonIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '~/lib/utils'

import { Icons } from '../ui/icons'

interface MessageProps {
  message: {
    id: 'loading-message' | string
    text: string | React.JSX.Element
    isUserMessage: boolean
    createdAt: string
  }
  isNextMessageSamePerson: boolean
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-end', message.isUserMessage && 'justify-end')}
      >
        <div
          className={cn(
            'relative flex aspect-square size-6 items-center justify-center rounded-sm',
            message.isUserMessage
              ? 'order-2 bg-blue-600'
              : 'order-1 bg-zinc-800',
          )}
        >
          {message.isUserMessage ? (
            <PersonIcon className="size-3/4 fill-zinc-200 text-zinc-200" />
          ) : (
            <Icons.logo className="size-3/4 fill-zinc-200" />
          )}
        </div>

        <div
          className={cn(
            'mx-2 flex max-w-md flex-col space-y-2 text-base',
            message.isUserMessage ? 'order-1 items-end' : 'order-2 items-start',
          )}
        >
          <div
            className={cn(
              'inline-block rounded-lg px-4 py-2',
              message.isUserMessage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900',
              !isNextMessageSamePerson &&
                message.isUserMessage &&
                'rounded-br-none',
              !isNextMessageSamePerson &&
                !message.isUserMessage &&
                'rounded-bl-none',
            )}
          >
            {typeof message.text === 'string' ? (
              <ReactMarkdown
                className={cn('prose', message.isUserMessage && 'text-zinc-50')}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {message.id !== 'loading-message' && (
              <div
                className={cn(
                  'mt-2 w-full select-none text-right text-xs',
                  message.isUserMessage ? 'text-blue-300' : 'text-zinc-500',
                )}
              >
                {format(new Date(message.createdAt), 'MMM yyy')}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
Message.displayName = 'Message'
