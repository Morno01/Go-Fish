import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TripCard from '@/components/TripCard'
import PageHeader from '@/components/PageHeader'
import TripsClientFilter from './TripsClientFilter'

export default async function TripsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const typeFilter = params?.type || 'all'
  const fishingFilter = params?.fishing || ''

  let query = supabase
    .from('trips')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'active')
    .order('trip_date', { ascending: true })

  if (typeFilter !== 'all') query = query.eq('trip_type', typeFilter)
  if (fishingFilter) query = query.eq('fishing_type', fishingFilter)

  const { data: trips } = await query

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-700 pt-10 pb-4 px-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Fisketure</h1>
          <Link
            href="/trips/create"
            className="bg-white text-blue-700 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-50 transition"
          >
            <Plus size={16} />
            Opret tur
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <TripsClientFilter currentType={typeFilter} currentFishing={fishingFilter} />

        <div className="mt-4 space-y-3">
          {trips && trips.length > 0 ? (
            trips.map(trip => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-base font-medium">Ingen ture fundet</p>
              <p className="text-gray-400 text-sm mt-1">Prøv at ændre filtrene</p>
              <Link href="/trips/create" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                Opret en tur
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
