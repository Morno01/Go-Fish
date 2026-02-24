import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { FISHING_TYPES, FISH_SPECIES } from '../lib/utils'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import TripCard from '../components/TripCard'
import { Input, Button, ErrorMessage } from '../components/AuthForm'

function CreateTripModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', trip_type: 'meetup', location: '', date: '',
    max_participants: '', fishing_types: [], target_species: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((x) => x !== value) : [...f[field], value],
    }))
  }

  async function handleSubmit() {
    if (!form.title || !form.date || !form.location) {
      setError('Udfyld titel, sted og dato')
      return
    }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('trips').insert({
      title: form.title,
      trip_type: form.trip_type,
      location: form.location,
      date: form.date,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      fishing_types: form.fishing_types,
      target_species: form.target_species,
      user_id: user.id,
      participants_count: 0,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="font-bold text-gray-900">Opret tur</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          <Input
            label="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="F.eks. Havfiskeri ved Hundested"
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tur-type</p>
            <div className="flex gap-2">
              {[['meetup', 'Mødested'], ['samkoersel', 'Samkørsel']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, trip_type: val })}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    form.trip_type === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Sted"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="F.eks. Hundested Havn"
          />

          <Input
            label="Dato"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <Input
            label="Maks. deltagere (valgfrit)"
            type="number"
            value={form.max_participants}
            onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
            placeholder="F.eks. 4"
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Fiskeri-type</p>
            <div className="grid grid-cols-2 gap-2">
              {FISHING_TYPES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => toggle('fishing_types', id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    form.fishing_types.includes(id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Målarter (valgfrit)</p>
            <div className="flex flex-wrap gap-2">
              {FISH_SPECIES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle('target_species', s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.target_species.includes(s)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <ErrorMessage message={error} />
          <Button loading={loading} onClick={handleSubmit}>Opret tur</Button>
        </div>
      </div>
    </div>
  )
}

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [tripType, setTripType] = useState('all')
  const [fishingType, setFishingType] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    let q = supabase.from('trips').select('*, profiles(username)').order('date', { ascending: true })
    if (tripType !== 'all') q = q.eq('trip_type', tripType)
    if (fishingType !== 'all') q = q.contains('fishing_types', [fishingType])
    const { data } = await q
    setTrips(data || [])
  }

  useEffect(() => { load() }, [tripType, fishingType])

  return (
    <div className="pb-24">
      <PageHeader
        title="Fisketure"
        right={
          <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white rounded-xl p-2">
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

      {showCreate && (
        <CreateTripModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}

      <BottomNav />
    </div>
  )
}
