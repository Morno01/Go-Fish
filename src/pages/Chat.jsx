import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'

export default function Chat() {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('conversations')
        .select(`
          id,
          updated_at,
          messages(content, created_at),
          participant1:profiles!conversations_user1_id_fkey(id, full_name, username),
          participant2:profiles!conversations_user2_id_fkey(id, full_name, username)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (data) {
        setConversations(data.map((c) => ({
          ...c,
          other: c.participant1?.id === user.id ? c.participant2 : c.participant1,
          lastMsg: c.messages?.[c.messages.length - 1],
        })))
      }
    }
    load()
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title="Beskeder" />

      <div className="px-4 py-4">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">Ingen samtaler endnu</p>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-lg">🎣</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.other?.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMsg?.content ?? 'Start en samtale'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
