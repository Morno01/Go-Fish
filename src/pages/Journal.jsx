import { useState, useEffect } from 'react'
import { Plus, MapPin, Fish } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'

export default function Journal() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      setEntries(data || [])
    }
    load()
  }, [])

  return (
    <div className="pb-24">
      <PageHeader
        title="Journal"
        right={
          <button className="bg-blue-600 text-white rounded-xl p-2">
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-4 py-4">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl">📒</span>
            <p className="mt-3 text-sm">Ingen logbogs­indlæg endnu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl border shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{e.title}</h3>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(e.date)}</span>
                </div>

                {e.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin size={11} /> {e.location}
                  </p>
                )}

                {e.catches?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {e.catches.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        <Fish size={10} /> {c.species} {c.weight && `· ${c.weight}kg`}
                      </span>
                    ))}
                  </div>
                )}

                {e.conditions && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(e.conditions).map(([k, v]) => v && (
                      <span key={k} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
