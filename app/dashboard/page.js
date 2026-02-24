import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus, Fish, TrendingUp, Users, Calendar } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TripCard from '@/components/TripCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: trips } = await supabase
    .from('trips')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'active')
    .order('trip_date', { ascending: true })
    .limit(5)

  const { data: myTrips } = await supabase
    .from('trips')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top header */}
      <header className="bg-blue-700 pt-10 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-5 -left-5 w-28 h-28 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between max-w-lg mx-auto">
          <div>
            <p className="text-blue-200 text-sm">Goddag,</p>
            <h1 className="text-white font-bold text-2xl mt-0.5">
              {profile?.full_name || profile?.username || 'Fisker'} 👋
            </h1>
            <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
              <Fish size={14} />
              Klar til at fiske?
            </p>
          </div>
          <Link
            href="/trips/create"
            className="bg-white text-blue-700 p-2.5 rounded-xl shadow-md hover:bg-blue-50 transition"
          >
            <Plus size={22} />
          </Link>
        </div>
      </header>

      {/* Stats bar */}
      <div className="max-w-lg mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-2">
          <StatItem icon={<Fish size={18} className="text-blue-500" />} label="Mine ture" value={myTrips?.length || 0} />
          <StatItem icon={<Users size={18} className="text-teal-500" />} label="Matches" value="–" />
          <StatItem icon={<TrendingUp size={18} className="text-amber-500" />} label="Fangster" value="–" />
        </div>
      </div>

      {/* Map placeholder */}
      <div className="max-w-lg mx-auto px-4 mt-5">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              Ture i nærheden
            </h2>
            <span className="text-xs text-gray-400">Kort kommer snart</span>
          </div>
          {/* Map placeholder */}
          <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 h-44 flex items-center justify-center mx-4 mb-4 rounded-xl border border-blue-100">
            <div className="text-center">
              <MapPin size={32} className="text-blue-300 mx-auto mb-2" />
              <p className="text-blue-400 text-sm font-medium">Interaktivt kort</p>
              <p className="text-blue-300 text-xs">Kommer snart</p>
            </div>
            {/* Fake location pins */}
            <div className="absolute top-6 left-12 w-3 h-3 bg-blue-500 rounded-full shadow-sm" />
            <div className="absolute top-16 right-16 w-3 h-3 bg-teal-500 rounded-full shadow-sm" />
            <div className="absolute bottom-10 left-1/3 w-3 h-3 bg-blue-400 rounded-full shadow-sm" />
          </div>
        </div>
      </div>

      {/* Upcoming trips */}
      <div className="max-w-lg mx-auto px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            Kommende ture
          </h2>
          <Link href="/trips" className="text-blue-600 text-sm font-medium">Se alle</Link>
        </div>
        <div className="space-y-3">
          {trips && trips.length > 0 ? (
            trips.map(trip => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <Fish size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Ingen ture endnu</p>
              <Link href="/trips/create" className="inline-block mt-3 text-blue-600 text-sm font-medium">
                Opret den første tur
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2">
      {icon}
      <span className="font-bold text-gray-900 text-lg">{value}</span>
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
  )
}
