import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, Fish, Calendar, MapPin } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { formatDate } from '@/lib/utils'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('fishing_date', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-700 pt-10 pb-4 px-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">Journal</h1>
            <p className="text-blue-200 text-sm">Dine fiskelogsindlæg</p>
          </div>
          <Link
            href="/journal/create"
            className="bg-white text-blue-700 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold shadow-sm"
          >
            <Plus size={16} />
            Ny log
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(entry => (
              <Link key={entry.id} href={`/journal/${entry.id}`}>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                    {!entry.is_public && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Privat</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={13} className="text-blue-400" />
                      <span>{formatDate(entry.fishing_date)}</span>
                    </div>
                    {entry.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={13} className="text-blue-400" />
                        <span>{entry.location}</span>
                      </div>
                    )}
                    {entry.fish_caught?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Fish size={13} className="text-teal-400" />
                        <span>{entry.fish_caught.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  {/* Conditions chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.weather && <Chip>{entry.weather}</Chip>}
                    {entry.moon_phase && <Chip>{entry.moon_phase}</Chip>}
                    {entry.tide && <Chip>{entry.tide}</Chip>}
                    {entry.pressure && <Chip>{entry.pressure}</Chip>}
                    {entry.temperature != null && <Chip>{entry.temperature}°C luft</Chip>}
                    {entry.water_temp != null && <Chip>{entry.water_temp}°C vand</Chip>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <BookOpen size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">Ingen journalindlæg endnu</h3>
            <p className="text-gray-400 text-sm mt-1">Log dine fisketure og hold styr på fangster og vejr</p>
            <Link href="/journal/create" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              Opret første log
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function Chip({ children }) {
  return (
    <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">{children}</span>
  )
}
