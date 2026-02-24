import { useState, useEffect } from 'react'
import { MapPin, Fish } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import TripCard from '../components/TripCard'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [trips, setTrips] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: t } = await supabase
        .from('trips')
        .select('*, profiles(username)')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5)
      setTrips(t || [])
    }
    load()
  }, [])

  return (
    <div className="pb-24">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 pt-12 pb-6 text-white">
        <p className="text-blue-100 text-sm">God dag,</p>
        <h1 className="text-2xl font-bold">{profile?.full_name?.split(' ')[0] ?? 'Fisker'} 🎣</h1>
      </header>

      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[['Ture', '0', Fish], ['Matches', '0', '❤️'], ['Fangster', '0', '🐟']].map(([label, val, Icon]) => (
            <div key={label} className="bg-white rounded-2xl border p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{val}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 h-48 flex items-center justify-center mb-6">
          <div className="text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2" />
            <p className="text-sm">Kort kommer snart</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">Kommende ture</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Ingen kommende ture</p>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
