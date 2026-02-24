'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, UserPlus, UserCheck } from 'lucide-react'

export default function JoinTripButton({ tripId, userId, creatorId, isParticipant, isFull }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    const supabase = createClient()

    if (isParticipant) {
      await supabase.from('trip_participants').delete().eq('trip_id', tripId).eq('user_id', userId)
      await supabase.from('trips').update({ current_participants: supabase.rpc('decrement') }).eq('id', tripId)
    } else {
      await supabase.from('trip_participants').insert({
        trip_id: tripId,
        user_id: userId,
        status: 'accepted',
      })
      await supabase.rpc('increment_participants', { trip_id: tripId })
    }

    setLoading(false)
    router.refresh()
  }

  async function handleContact() {
    const supabase = createClient()
    // Find or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${creatorId}),and(participant_1.eq.${creatorId},participant_2.eq.${userId})`)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: conv } = await supabase.from('conversations').insert({
      participant_1: userId,
      participant_2: creatorId,
    }).select().single()

    if (conv) router.push(`/chat/${conv.id}`)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleContact}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition active:scale-[0.98]"
      >
        <MessageCircle size={18} />
        Kontakt arrangør
      </button>
      <button
        onClick={handleJoin}
        disabled={loading || (isFull && !isParticipant)}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition active:scale-[0.98] disabled:opacity-50 ${
          isParticipant
            ? 'bg-gray-100 text-gray-600 border-2 border-gray-200'
            : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
        }`}
      >
        {isParticipant ? <><UserCheck size={18} />Tilmeldt</> : <><UserPlus size={18} />Tilmeld dig</>}
      </button>
    </div>
  )
}
