import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import ChatWindow from './ChatWindow'

export default async function ChatConversationPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: conv } = await supabase
    .from('conversations')
    .select(`
      *,
      p1:profiles!conversations_participant_1_fkey(id, username, full_name, avatar_url),
      p2:profiles!conversations_participant_2_fkey(id, username, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!conv || (conv.participant_1 !== user.id && conv.participant_2 !== user.id)) {
    notFound()
  }

  const other = conv.participant_1 === user.id ? conv.p2 : conv.p1

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(username, avatar_url)')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        title={other?.full_name || other?.username || 'Samtale'}
        backHref="/chat"
      />
      <ChatWindow
        conversationId={id}
        userId={user.id}
        initialMessages={messages || []}
        otherUser={other}
      />
    </div>
  )
}
