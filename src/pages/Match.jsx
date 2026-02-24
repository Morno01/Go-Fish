import { useState, useEffect } from 'react'
import { Heart, X, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'

function ProfileCard({ profile, onLike, onPass }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-blue-400 to-cyan-300 h-48 flex items-center justify-center">
        <span className="text-6xl">🎣</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{profile.full_name}</h3>
        <p className="text-sm text-gray-500 mb-3">@{profile.username}</p>

        {profile.fishing_types?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {profile.fishing_types.map((t) => (
              <span key={t} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        {profile.regions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.regions.map((r) => (
              <span key={r} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">📍 {r}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onPass(profile.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <X size={20} /> Pas
          </button>
          <button
            onClick={() => onLike(profile.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Heart size={20} /> Like
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Match() {
  const [tab, setTab] = useState('discover')
  const [candidates, setCandidates] = useState([])
  const [matches, setMatches] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [matchPopup, setMatchPopup] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      const { data: swipes } = await supabase.from('swipes').select('target_id').eq('swiper_id', user.id)
      const swipedIds = (swipes || []).map((s) => s.target_id)

      let q = supabase.from('profiles').select('*').neq('id', user.id)
      if (swipedIds.length > 0) q = q.not('id', 'in', `(${swipedIds.join(',')})`)
      const { data: cands } = await q.limit(10)
      setCandidates(cands || [])

      const { data: myMatches } = await supabase
        .from('matches')
        .select('*, profiles!matches_user2_id_fkey(full_name, username)')
        .eq('user1_id', user.id)
      setMatches(myMatches || [])
    }
    load()
  }, [])

  async function handleLike(targetId) {
    if (!currentUser) return
    await supabase.from('swipes').insert({ swiper_id: currentUser.id, target_id: targetId, action: 'like' })
    const { data: theyLikedMe } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', targetId)
      .eq('target_id', currentUser.id)
      .eq('action', 'like')
      .single()

    if (theyLikedMe) {
      await supabase.from('matches').insert({ user1_id: currentUser.id, user2_id: targetId })
      const matched = candidates.find((c) => c.id === targetId)
      setMatchPopup(matched)
    }
    setCandidates((prev) => prev.filter((c) => c.id !== targetId))
  }

  async function handlePass(targetId) {
    if (!currentUser) return
    await supabase.from('swipes').insert({ swiper_id: currentUser.id, target_id: targetId, action: 'pass' })
    setCandidates((prev) => prev.filter((c) => c.id !== targetId))
  }

  return (
    <div className="pb-24">
      <PageHeader title="Match" />

      <div className="flex border-b">
        {[['discover', 'Opdag'], ['matches', 'Matches']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === val ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === 'discover' && (
          candidates.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-4xl">🎣</span>
              <p className="mt-3 text-sm">Ingen flere profiler at vise</p>
            </div>
          ) : (
            <ProfileCard
              profile={candidates[0]}
              onLike={handleLike}
              onPass={handlePass}
            />
          )
        )}

        {tab === 'matches' && (
          matches.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Ingen matches endnu</p>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">🎣</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{m.profiles?.full_name}</p>
                    <p className="text-xs text-gray-400">@{m.profiles?.username}</p>
                  </div>
                  <button className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <MessageCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {matchPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Det er et match!</h2>
            <p className="text-gray-500 text-sm mb-5">Du og {matchPopup.full_name} kan lide hinanden</p>
            <button
              onClick={() => setMatchPopup(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Fortsæt
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
