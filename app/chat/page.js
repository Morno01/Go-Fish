import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Search } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { formatDate } from '@/lib/utils'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      p1:profiles!conversations_participant_1_fkey(id, username, full_name, avatar_url),
      p2:profiles!conversations_participant_2_fkey(id, username, full_name, avatar_url)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-700 pt-10 pb-4 px-6 max-w-lg mx-auto">
        <h1 className="text-white font-bold text-xl">Beskeder</h1>
        <p className="text-blue-200 text-sm">Chat med andre fiskere</p>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {conversations && conversations.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {conversations.map((conv, idx) => {
              const other = conv.participant_1 === user.id ? conv.p2 : conv.p1
              return (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition ${idx !== conversations.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                      {other?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm">{other?.full_name || other?.username}</p>
                        <p className="text-xs text-gray-400">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' }) : ''}</p>
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-0.5">{conv.last_message || 'Start en samtale...'}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">Ingen samtaler endnu</h3>
            <p className="text-gray-400 text-sm mt-1">Match med en fisker eller tilmeld dig en tur for at starte en chat</p>
            <Link href="/match" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Gå til Match
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
