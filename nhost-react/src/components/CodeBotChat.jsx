import React, { useState, useEffect, useRef } from 'react'
import { nhost } from '../lib/nhost'
import { useAuthenticationStatus, useUserId } from '@nhost/react'
import { createClient } from 'graphql-ws'
import { useNavigate } from 'react-router-dom'

// WebSocket GraphQL client
const wsClient = createClient({
  url: nhost.graphql.getUrl().replace('http', 'ws'),
  connectionParams: async () => {
    const token = await nhost.auth.getAccessToken()
    return { headers: { Authorization: `Bearer ${token}` } }
  }
})

// GraphQL queries/mutations
const GET_CHATS = `
  query {
    chats {
      id
      title
      created_at
    }
  }
`

const SUBSCRIBE_MESSAGES = `
  subscription($chat_id: uuid!) {
    messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
      id
      sender_id
      text
      created_at
    }
  }
`

const SEND_MESSAGE = `
  mutation($chat_id: uuid!, $text: String!) {
    insert_messages_one(object: { chat_id: $chat_id, text: $text }) {
      id
    }
  }
`

export default function CodeBotChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatList, setChatList] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const messagesEndRef = useRef(null)
  const { isAuthenticated } = useAuthenticationStatus()
  const userId = useUserId()
  const navigate = useNavigate()

  // Fetch chats
  useEffect(() => {
    if (!isAuthenticated) return
    nhost.graphql.request(GET_CHATS).then(({ data }) => {
      setChatList(data?.chats || [])
      if (data?.chats?.length > 0) {
        setSelectedChatId(data.chats[0].id)
      }
    })
  }, [isAuthenticated])

  // Subscribe to messages of selected chat
  useEffect(() => {
    if (!isAuthenticated || !selectedChatId) return

    let isActive = true
    wsClient.subscribe(
      { query: SUBSCRIBE_MESSAGES, variables: { chat_id: selectedChatId } },
      {
        next: (data) => {
          if (isActive && data.data?.messages) {
            setMessages(data.data.messages)
          }
        },
        error: console.error,
        complete: () => console.log('Subscription complete')
      }
    )

    return () => {
      isActive = false
    }
  }, [isAuthenticated, selectedChatId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId) return

    // Send user message
    await nhost.graphql.request(SEND_MESSAGE, {
      chat_id: selectedChatId,
      text: input
    })

    // Send message to chatbot webhook
    try {
      const res = await fetch('https://YOUR-N8N-WEBHOOK-URL/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedChatId, message: input })
      })
      const botReply = await res.json()

      if (botReply?.reply) {
        await nhost.graphql.request(SEND_MESSAGE, {
          chat_id: selectedChatId,
          text: botReply.reply
        })
      }
    } catch (err) {
      console.error('Bot reply error:', err)
    }

    setInput('')
  }

  const handleLogout = async () => {
    await nhost.auth.signOut()
    navigate('/signin')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-xl text-gray-700">
        Please sign in to start chatting.
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div
        className="flex border rounded-lg overflow-hidden shadow-lg bg-white"
        style={{ height: '80vh', width: '80vw' }}
      >
        {/* Chat List */}
        <div className="w-1/3 bg-gray-900 text-white flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold">Chats</h2>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
            >
              Logout
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {chatList.length > 0 ? (
              chatList.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-800 ${
                    chat.id === selectedChatId
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                  }`}
                >
                  {chat.title || `Chat ${chat.id.slice(0, 5)}`}
                </div>
              ))
            ) : (
              <div className="text-gray-400">No chats yet</div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="w-2/3 flex flex-col bg-gray-200">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender_id === userId
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-300 text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex border-t p-2 bg-white">
            <input
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
