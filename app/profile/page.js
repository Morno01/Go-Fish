import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings, Fish, MapPin, BookOpen, Edit2, LogOut } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { FISHING_TYPES } from '@/lib/utils'
import LogoutButton from './LogoutButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myTrips } = await supabase
    .from('trips')
    .select('id, title, trip_date, status')
    .eq('creator_id', user.id)
    .order('trip_date', { ascending: false })
    .limit(5)

  const { data: myJournal } = await supabase
    .from('journal_entries')
    .select('id, title, fishing_date')
    .eq('user_id', user.id)
    .order('fishing_date', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-700 pt-10 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative flex justify-end">
          <Link href="/profile/edit" className="text-white/80 hover:text-white transition">
            <Edit2 size={20} />
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 space-y-4">
        {/* Avatar + name */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl mx-auto mb-3 ring-4 ring-white shadow-sm">
            {profile?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <h1 className="font-bold text-gray-900 text-xl">{profile?.full_name || profile?.username}</h1>
          <p className="text-gray-400 text-sm mt-0.5">@{profile?.username}</p>
          {profile?.location && (
            <p className="flex items-center justify-center gap-1 text-gray-400 text-sm mt-1">
              <MapPin size={13} /> {profile.location}
            </p>
          )}
          {profile?.bio && (
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            {profile?.has_car && <Badge>🚗 Har bil</Badge>}
            {profile?.has_boat && <Badge>⛵ Har båd</Badge>}
            {profile?.experience_level && <Badge>{profile.experience_level === 'beginner' ? '🎣 Nybegynder' : profile.experience_level === 'intermediate' ? '🎣 Øvet' : '🎣 Ekspert'}</Badge>}
          </div>
        </div>

        {/* Fishing prefs */}
        {(profile?.fishing_types?.length > 0 || profile?.fish_species?.length > 0 || profile?.regions?.length > 0) && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Fish size={16} className="text-blue-500" /> Fiskepræferencer
            </h2>
            {profile.fishing_types?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Vandtype</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.fishing_types.map(ft => {
                    const t = FISHING_TYPES.find(x => x.value === ft)
                    return <span key={ft} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">{t?.icon} {t?.label || ft}</span>
                  })}
                </div>
              </div>
            )}
            {profile.fish_species?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Målarter</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.fish_species.map(s => (
                    <span key={s} className="text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.regions?.length > 0 && (
              <div>
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

        {/* My trips */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Mine ture</h2>
            <Link href="/trips/create" className="text-blue-600 text-xs font-medium">+ Ny tur</Link>
          </div>
          {myTrips && myTrips.length > 0 ? (
            <div className="space-y-2">
              {myTrips.map(t => (
                <Link key={t.id} href={`/trips/${t.id}`} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                  <Fish size={14} className="text-blue-400 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-gray-400">{new Date(t.trip_date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-3">Ingen ture endnu</p>
          )}
        </div>

        {/* Journal */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-blue-500" /> Seneste logs
            </h2>
            <Link href="/journal" className="text-blue-600 text-xs font-medium">Se alle</Link>
          </div>
          {myJournal && myJournal.length > 0 ? (
            <div className="space-y-2">
              {myJournal.map(e => (
                <Link key={e.id} href={`/journal/${e.id}`} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                  <BookOpen size={14} className="text-teal-400 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{e.title}</span>
                  <span className="text-xs text-gray-400">{new Date(e.fishing_date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-3">Ingen logs endnu</p>
          )}
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Link href="/profile/edit" className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition border-b border-gray-100">
            <Edit2 size={18} className="text-gray-400" />
            <span className="text-sm text-gray-700">Rediger profil</span>
          </Link>
          <LogoutButton />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{children}</span>
  )
}
