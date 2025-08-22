"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { Search, Plus, Hash, Users, Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "@/components/ChatMessage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const mockChatRooms = [
  {
    id: "1",
    name: "General",
    type: "channel" as const,
    unreadCount: 3,
    lastMessage: "Hey everyone, how's the project going?",
    lastMessageTime: "2 min ago"
  },
  {
    id: "2",
    name: "Website Redesign",
    type: "channel" as const,
    unreadCount: 0,
    lastMessage: "I've uploaded the latest mockups",
    lastMessageTime: "1 hour ago"
  },
  {
    id: "3",
    name: "Random",
    type: "channel" as const,
    unreadCount: 1,
    lastMessage: "Anyone up for lunch?",
    lastMessageTime: "3 hours ago"
  }
]

const mockDirectMessages = [
  {
    id: "dm1",
    name: "Jane Smith",
    type: "dm" as const,
    avatar: "",
    unreadCount: 2,
    lastMessage: "Can you review the designs?",
    lastMessageTime: "5 min ago",
    isOnline: true
  },
  {
    id: "dm2",
    name: "Mike Johnson",
    type: "dm" as const,
    avatar: "",
    unreadCount: 0,
    lastMessage: "Thanks for the help!",
    lastMessageTime: "2 hours ago",
    isOnline: false
  },
  {
    id: "dm3",
    name: "Sarah Wilson",
    type: "dm" as const,
    avatar: "",
    unreadCount: 0,
    lastMessage: "See you tomorrow",
    lastMessageTime: "1 day ago",
    isOnline: true
  }
]

const mockMessages = [
  {
    id: "1",
    content: "Good morning everyone! Hope you all had a great weekend.",
    sender: { name: "Jane Smith", avatar: "" },
    timestamp: "9:00 AM",
    isCurrentUser: false
  },
  {
    id: "2",
    content: "Morning Jane! Yes, it was great. Ready to tackle this week's tasks.",
    sender: { name: "Mike Johnson", avatar: "" },
    timestamp: "9:05 AM",
    isCurrentUser: false
  },
  {
    id: "3",
    content: "I've been working on the homepage designs over the weekend. Should I share them now or wait for the design review meeting?",
    sender: { name: "Jane Smith", avatar: "" },
    timestamp: "9:10 AM",
    isCurrentUser: false
  },
  {
    id: "4",
    content: "Please share them now! I'm excited to see what you've come up with.",
    sender: { name: "You", avatar: "" },
    timestamp: "9:12 AM",
    isCurrentUser: true
  },
  {
    id: "5",
    content: "Here are the latest mockups: [Design File Link]. Let me know what you think!",
    sender: { name: "Jane Smith", avatar: "" },
    timestamp: "9:15 AM",
    isCurrentUser: false
  },
  {
    id: "6",
    content: "These look amazing! The color scheme is perfect. When can we start implementing?",
    sender: { name: "Mike Johnson", avatar: "" },
    timestamp: "9:20 AM",
    isCurrentUser: false
  }
]

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("1")
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const selectedChatData = [...mockChatRooms, ...mockDirectMessages].find(
    chat => chat.id === selectedChat
  )

  const filteredRooms = mockChatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDMs = mockDirectMessages.filter(dm =>
    dm.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message
      setMessageInput("")
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Channels */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Hash className="h-3 w-3" />
              Channels
            </h3>
            <div className="space-y-1">
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedChat === room.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedChat(room.id)}
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{room.name}</p>
                      {room.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.lastMessage}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Direct Messages
            </h3>
            <div className="space-y-1">
              {filteredDMs.map((dm) => (
                <motion.div
                  key={dm.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedChat === dm.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedChat(dm.id)}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={dm.avatar} />
                      <AvatarFallback className="text-xs">
                        {dm.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {dm.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{dm.name}</p>
                      {dm.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {dm.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {dm.lastMessage}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedChatData && (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                {selectedChatData.type === "channel" ? (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(selectedChatData as any).avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedChatData.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h2 className="font-semibold">{selectedChatData.name}</h2>
                  {selectedChatData.type === "dm" && (
                    <p className="text-xs text-muted-foreground">
                      {(selectedChatData as any).isOnline ? "Online" : "Offline"}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            </CardContent>

            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
