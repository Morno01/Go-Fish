import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MapPin, Fish, MessageCircle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import BottomNav from '@/components/BottomNav'
import { FISHING_TYPES } from '@/lib/utils'
import ContactButton from './ContactButton'

export default async function UserProfilePage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  if (id === user.id) redirect('/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: publicTrips } = await supabase
    .from('trips')
    .select('id, title, trip_date, fishing_type, trip_type')
    .eq('creator_id', id)
    .eq('status', 'active')
    .order('trip_date', { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Fiskerprofil" backHref="/match" />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 h-28" />
          <div className="px-5 pb-5 -mt-10">
            <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-blue-700 font-bold text-3xl shadow-sm mb-3">
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
            <h1 className="font-bold text-gray-900 text-xl">{profile.full_name || profile.username}</h1>
            <p className="text-gray-400 text-sm">@{profile.username}</p>
            {profile.location && (
              <p className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <MapPin size={13} /> {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.has_car && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">🚗 Har bil</span>}
              {profile.has_boat && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">⛵ Har båd</span>}
              {profile.experience_level && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full capitalize">{profile.experience_level}</span>
              )}
            </div>
          </div>
        </div>

        {/* Fishing prefs */}
        {profile.fishing_types?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Fish size={15} className="text-blue-500" /> Fisker i
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.fishing_types.map(ft => {
                const t = FISHING_TYPES.find(x => x.value === ft)
                return <span key={ft} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">{t?.icon} {t?.label || ft}</span>
              })}
            </div>
            {profile.fish_species?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1.5">Målarter</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.fish_species.map(s => (
                    <span key={s} className="text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.regions?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1.5">Regioner</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.regions.map(r => (
                    <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trips */}
        {publicTrips && publicTrips.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Aktive ture</h2>
            <div className="space-y-2">
              {publicTrips.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl">
                  <Fish size={14} className="text-blue-400 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-gray-400">{new Date(t.trip_date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <ContactButton userId={user.id} targetId={id} />
      </div>

      <BottomNav />
    </div>
  )
}
