import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { FISHING_TYPES } from '../lib/utils'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import TripCard from '../components/TripCard'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [tripType, setTripType] = useState('all')
  const [fishingType, setFishingType] = useState('all')

  useEffect(() => {
    async function load() {
      let q = supabase.from('trips').select('*, profiles(username)').order('date', { ascending: true })
      if (tripType !== 'all') q = q.eq('trip_type', tripType)
      if (fishingType !== 'all') q = q.contains('fishing_types', [fishingType])
      const { data } = await q
      setTrips(data || [])
    }
    load()
  }, [tripType, fishingType])

  return (
    <div className="pb-24">
      <PageHeader
        title="Fiske­ture"
        right={
          <button className="bg-blue-600 text-white rounded-xl p-2">
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-4 py-3 border-b">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[['all', 'Alle'], ['samkoersel', 'Samkørsel'], ['meetup', 'Mødested']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTripType(val)}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                tripType === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto mt-2">
          <button
            onClick={() => setFishingType('all')}
            className={`shrink-0 text-xs px-3 py-1 rounded-full border ${fishingType === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
          >
            Alle typer
          </button>
          {FISHING_TYPES.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setFishingType(id)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full border ${fishingType === id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {trips.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Ingen ture fundet</p>
        ) : (
          trips.map((t) => <TripCard key={t.id} trip={t} />)
        )}
      </div>

      <BottomNav />
    </div>
  )
}
