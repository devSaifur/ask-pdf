import { PersonIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { forwardRef } from 'react'

import { cn } from '~/lib/utils'

import { MemoizedReactMarkdown } from '../markdown'
import { Icons } from '../ui/icons'

interface MessageProps {
  message: {
    id: string | number
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
        key={message.id}
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
                : 'bg-gray-300/75 text-gray-900',
              !isNextMessageSamePerson &&
                message.isUserMessage &&
                'rounded-br-none',
              !isNextMessageSamePerson &&
                !message.isUserMessage &&
                'rounded-bl-none',
            )}
          >
            {typeof message.text === 'string' ? (
              <MemoizedReactMarkdown
                className={cn('prose', {
                  'text-zinc-50': message.isUserMessage,
                })}
              >
                {message.text}
              </MemoizedReactMarkdown>
            ) : (
              message.text
            )}

            {message.id.toString() !== 'loading-message' && (
              <div
                className={cn(
                  'mt-2 w-full select-none text-right text-xs',
                  message.isUserMessage ? 'text-blue-300' : 'text-zinc-500',
                )}
              >
                {format(new Date(message.createdAt), 'h:mm:aaa')}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
Message.displayName = 'Message'
