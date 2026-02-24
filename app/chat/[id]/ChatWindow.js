'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

export default function ChatWindow({ conversationId, userId, initialMessages, otherUser }) {
  const [messages, setMessages] = useState(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        payload => {
          if (payload.new.sender_id !== userId) {
            setMessages(prev => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversationId, userId])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)

    const msg = {
      conversation_id: conversationId,
      sender_id: userId,
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    setText('')

    const supabase = createClient()
    await supabase.from('messages').insert(msg)
    await supabase.from('conversations').update({
      last_message: msg.content,
      last_message_at: msg.created_at,
    }).eq('id', conversationId)

    setSending(false)
  }

  return (
    <div className="flex flex-col flex-1" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            Sig hej til {otherUser?.username} 👋
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mr-2 self-end shrink-0">
                  {otherUser?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Skriv en besked..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
