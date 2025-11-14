"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    id: string
    content: string
    sender: {
      name: string
      avatar?: string
    }
    timestamp: string
    isCurrentUser: boolean
  }
  onShowActions?: () => void
}

import { memo } from "react"

function ChatMessageInner({ message, onShowActions }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4",
        message.isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar for other users, 3-dot menu for current user */}
      {message.isCurrentUser ? (
        <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted rounded-full"
            onClick={onShowActions}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className="text-xs">
            {message.sender.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          message.isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            message.isCurrentUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {!message.isCurrentUser && (
            <span className="font-medium">{message.sender.name}</span>
          )}
          <span>{message.timestamp}</span>
        </div>
      </div>
    </motion.div>
  )
}

export const ChatMessage = memo(ChatMessageInner)
