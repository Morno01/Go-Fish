'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle } from 'lucide-react'

export default function ContactButton({ userId, targetId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${targetId}),and(participant_1.eq.${targetId},participant_2.eq.${userId})`)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: conv } = await supabase.from('conversations').insert({
      participant_1: userId,
      participant_2: targetId,
    }).select().single()

    if (conv) router.push(`/chat/${conv.id}`)
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md transition active:scale-[0.98] disabled:opacity-50"
    >
      <MessageCircle size={20} />
      Send besked
    </button>
  )
}
