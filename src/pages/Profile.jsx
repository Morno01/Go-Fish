import { useState, useEffect } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FISHING_TYPES, EXPERIENCE_LEVELS } from '../lib/utils'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!profile) return <div className="p-8 text-center text-gray-400">Indlæser...</div>

  const expLabel = EXPERIENCE_LEVELS.find((l) => l.id === profile.experience_level)?.label

  return (
    <div className="pb-24">
      <PageHeader
        title="Profil"
        right={
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Settings size={20} />
          </button>
        }
      />

      <div className="px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center text-3xl">
            🎣
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            {expLabel && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{expLabel}</span>
            )}
          </div>
        </div>

        {profile.fishing_types?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Foretrukket fiskeri</h3>
            <div className="flex flex-wrap gap-2">
              {profile.fishing_types.map((id) => {
                const ft = FISHING_TYPES.find((f) => f.id === id)
                return (
                  <span key={id} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {ft?.icon} {ft?.label ?? id}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {profile.target_species?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Målarter</h3>
            <div className="flex flex-wrap gap-1">
              {profile.target_species.map((s) => (
                <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {profile.regions?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Regioner</h3>
            <div className="flex flex-wrap gap-1">
              {profile.regions.map((r) => (
                <span key={r} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">📍 {r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {profile.has_boat && <span className="bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded-full">⛵ Båd</span>}
          {profile.has_car && <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">🚗 Bil</span>}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
        >
          <LogOut size={16} /> Log ud
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
