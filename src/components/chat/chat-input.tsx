import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { useContext, useRef } from 'react'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { ChatContext } from './chat-context'

export default function ChatInput({ isDisabled }: { isDisabled?: boolean }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isPending, addMessage, handleInputChange, message } =
    useContext(ChatContext)

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        action=""
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    addMessage()
                    textareaRef.current?.focus()
                  }
                }}
                onChange={handleInputChange}
                value={message}
                autoFocus
                rows={1}
                maxRows={4}
                placeholder="Enter your question..."
                className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch resize-none py-3 pr-12 text-base"
              />

              <Button
                onMouseDown={(e) => {
                  e.preventDefault()
                  addMessage()
                  textareaRef.current?.focus()
                }}
                type="submit"
                disabled={isPending || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send message"
              >
                <PaperPlaneIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
