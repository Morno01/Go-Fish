import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Calendar, MapPin, Fish, Thermometer, Wind, Moon, Droplets, Gauge } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import BottomNav from '@/components/BottomNav'
import { formatDate } from '@/lib/utils'

export default async function JournalEntryPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*, profiles(username, full_name)')
    .eq('id', id)
    .single()

  if (!entry || (!entry.is_public && entry.user_id !== user.id)) notFound()

  const isOwner = entry.user_id === user.id

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Journallog" backHref="/journal" action={
        isOwner ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Din log</span>
        ) : null
      } />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Title card */}
        <div className="bg-blue-700 rounded-2xl p-5">
          <h1 className="text-white font-bold text-xl mb-3">{entry.title}</h1>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Calendar size={14} />
              <span>{formatDate(entry.fishing_date)}</span>
            </div>
            {entry.location && (
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <MapPin size={14} />
                <span>{entry.location}</span>
                {entry.latitude && entry.longitude && (
                  <span className="text-blue-300 text-xs ml-1">({parseFloat(entry.latitude).toFixed(4)}, {parseFloat(entry.longitude).toFixed(4)})</span>
                )}
              </div>
            )}
            {entry.fishing_type && (
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <Fish size={14} />
                <span className="capitalize">{entry.fishing_type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fish caught */}
        {entry.fish_caught?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Fish size={16} className="text-teal-500" /> Fangster
            </h2>
            <div className="flex flex-wrap gap-2">
              {entry.fish_caught.map((f, i) => (
                <span key={i} className="bg-teal-50 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  🐟 {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weather conditions */}
        {(entry.weather || entry.temperature != null || entry.water_temp != null || entry.wind_speed || entry.moon_phase || entry.tide || entry.pressure) && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Vejr & forhold</h2>
            <div className="grid grid-cols-2 gap-3">
              {entry.weather && <ConditionItem icon={<span className="text-lg">⛅</span>} label="Vejr" value={entry.weather} />}
              {entry.temperature != null && <ConditionItem icon={<Thermometer size={16} className="text-orange-500" />} label="Lufttemperatur" value={`${entry.temperature}°C`} />}
              {entry.water_temp != null && <ConditionItem icon={<Droplets size={16} className="text-blue-500" />} label="Vandtemperatur" value={`${entry.water_temp}°C`} />}
              {entry.wind_speed && <ConditionItem icon={<Wind size={16} className="text-gray-400" />} label="Vind" value={`${entry.wind_speed}${entry.wind_direction ? ` (${entry.wind_direction})` : ''}`} />}
              {entry.pressure && <ConditionItem icon={<Gauge size={16} className="text-purple-500" />} label="Lufttryk" value={entry.pressure} />}
              {entry.tide && <ConditionItem icon={<span className="text-lg">🌊</span>} label="Tidevand" value={entry.tide} />}
              {entry.moon_phase && <ConditionItem icon={<Moon size={16} className="text-yellow-500" />} label="Månefase" value={entry.moon_phase} />}
            </div>
          </div>
        )}

        {/* Gear */}
        {entry.gear_used?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Grej & udstyr</h2>
            <div className="space-y-2">
              {entry.gear_used.map((g, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-xl">
                  <span className="font-medium">{g.type}</span>
                  {g.size && <span className="text-gray-400">· {g.size}</span>}
                  {g.brand && <span className="text-gray-400">· {g.brand}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-2">Noter</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}

        {/* Author */}
        {!isOwner && (
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400">Log af {entry.profiles?.full_name || entry.profiles?.username}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function ConditionItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2.5">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}
