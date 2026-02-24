'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Heart, Fish, MapPin, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FISHING_TYPES } from '@/lib/utils'

export default function SwipeCard({ candidates, userId, myMatches }) {
  const router = useRouter()
  const [cards, setCards] = useState(candidates)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [anim, setAnim] = useState(null) // 'left' | 'right'
  const [matchPopup, setMatchPopup] = useState(null)
  const [activeTab, setActiveTab] = useState('discover') // 'discover' | 'matches'

  const current = cards[currentIdx]

  async function handleSwipe(action) {
    if (!current) return
    setAnim(action === 'like' ? 'right' : 'left')

    const supabase = createClient()
    await supabase.from('matches').upsert({
      user_id: userId,
      target_id: current.id,
      action,
    })

    if (action === 'like') {
      // Check if they already liked us
      const { data } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', current.id)
        .eq('target_id', userId)
        .eq('action', 'like')
        .single()

      if (data) {
        setMatchPopup(current)
      }
    }

    setTimeout(() => {
      setAnim(null)
      setCurrentIdx(i => i + 1)
    }, 300)
  }

  async function handleMessage(profile) {
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${userId},participant_2.eq.${profile.id}),and(participant_1.eq.${profile.id},participant_2.eq.${userId})`)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: conv } = await supabase.from('conversations').insert({
      participant_1: userId,
      participant_2: profile.id,
    }).select().single()

    if (conv) router.push(`/chat/${conv.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-4">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'discover' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
        >
          Opdag
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 ${activeTab === 'matches' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
        >
          Matches
          {myMatches.length > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'matches' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
              {myMatches.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'discover' ? (
        <>
          {current ? (
            <div className={`${anim === 'left' ? 'swipe-left' : anim === 'right' ? 'swipe-right' : ''}`}>
              <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
                {/* Avatar / header */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-52 flex items-center justify-center relative">
                  <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-white font-bold text-5xl">
                    {current.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  {current.has_boat && (
                    <span className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full">⛵ Har båd</span>
                  )}
                  {current.has_car && (
                    <span className="absolute top-3 left-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full">🚗 Har bil</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-bold text-xl text-gray-900">{current.full_name || current.username}</h2>
                      <p className="text-gray-400 text-sm">@{current.username}</p>
                    </div>
                    {current.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={12} />
                        {current.location}
                      </span>
                    )}
                  </div>

                  {current.bio && (
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{current.bio}</p>
                  )}

                  {/* Fishing types */}
                  {current.fishing_types?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fisker i</p>
                      <div className="flex flex-wrap gap-1.5">
                        {current.fishing_types.map(ft => {
                          const type = FISHING_TYPES.find(t => t.value === ft)
                          return (
                            <span key={ft} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                              {type?.icon} {type?.label || ft}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fish species */}
                  {current.fish_species?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Målarter</p>
                      <div className="flex flex-wrap gap-1.5">
                        {current.fish_species.slice(0, 5).map(s => (
                          <span key={s} className="text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regions */}
                  {current.regions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Regioner</p>
                      <div className="flex flex-wrap gap-1.5">
                        {current.regions.map(r => (
                          <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Swipe buttons */}
              <div className="flex items-center justify-center gap-8 mt-6">
                <button
                  onClick={() => handleSwipe('pass')}
                  className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md hover:border-red-300 hover:bg-red-50 transition active:scale-95"
                >
                  <X size={28} className="text-red-400" />
                </button>
                <button
                  onClick={() => handleSwipe('like')}
                  className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition active:scale-95"
                >
                  <Heart size={32} className="text-white" fill="white" />
                </button>
              </div>

              <p className="text-center text-gray-400 text-xs mt-3">
                {cards.length - currentIdx - 1} fiskere tilbage
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <Fish size={48} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 text-lg">Ingen flere fiskere</h3>
              <p className="text-gray-400 text-sm mt-1">Kom tilbage senere for nye matches</p>
            </div>
          )}
        </>
      ) : (
        <div>
          {myMatches.length > 0 ? (
            <div className="space-y-3">
              {myMatches.map(match => (
                <div key={match.user_id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {match.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{match.profiles?.full_name || match.profiles?.username}</p>
                    <p className="text-gray-400 text-sm">@{match.profiles?.username}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {match.profiles?.fishing_types?.slice(0, 2).map(ft => {
                        const type = FISHING_TYPES.find(t => t.value === ft)
                        return (
                          <span key={ft} className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                            {type?.icon} {type?.label || ft}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMessage(match.profiles)}
                    className="p-3 bg-blue-600 rounded-xl text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <Heart size={48} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 text-lg">Ingen matches endnu</h3>
              <p className="text-gray-400 text-sm mt-1">Swipe for at finde din fiskepartner</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Start med at swipe
              </button>
            </div>
          )}
        </div>
      )}

      {/* Match popup */}
      {matchPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setMatchPopup(null)}>
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">🎣</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Det er et match!</h2>
            <p className="text-gray-500 text-sm mb-4">Du og {matchPopup.full_name || matchPopup.username} kan lide hinanden</p>
            <button
              onClick={() => { setMatchPopup(null); handleMessage(matchPopup) }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm mb-2"
            >
              <MessageCircle size={16} className="inline mr-2" />
              Send en besked
            </button>
            <button
              onClick={() => setMatchPopup(null)}
              className="w-full text-gray-400 py-2 text-sm"
            >
              Fortsæt med at swipe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
