import { useState, useEffect } from 'react'
import { Plus, X, MapPin, Fish } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, FISHING_TYPES, FISH_SPECIES } from '../lib/utils'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import { Input, Button, ErrorMessage } from '../components/AuthForm'

function CreateJournalModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', location: '', date: '', fishing_type: '',
    notes: '', catches: [],
  })
  const [newCatch, setNewCatch] = useState({ species: '', weight: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addCatch() {
    if (!newCatch.species) return
    setForm((f) => ({ ...f, catches: [...f.catches, { ...newCatch }] }))
    setNewCatch({ species: '', weight: '' })
  }

  function removeCatch(i) {
    setForm((f) => ({ ...f, catches: f.catches.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit() {
    if (!form.title || !form.date) { setError('Udfyld titel og dato'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: form.title,
      location: form.location || null,
      date: form.date,
      fishing_type: form.fishing_type || null,
      catches: form.catches,
      conditions: {},
      notes: form.notes || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Ny logbogspost</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <Input
            label="Titel"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="F.eks. Morgentur ved Hundested"
          />
          <Input
            label="Dato"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="Sted (valgfrit)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="F.eks. Hundested Havn"
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Fiskeri-type</p>
            <div className="flex flex-wrap gap-2">
              {FISHING_TYPES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setForm({ ...form, fishing_type: form.fishing_type === id ? '' : id })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.fishing_type === id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Fangster</p>
            {form.catches.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-2">
                <Fish size={14} className="text-blue-600 shrink-0" />
                <span className="text-sm text-blue-800 flex-1">{c.species}{c.weight ? ` · ${c.weight} kg` : ''}</span>
                <button onClick={() => removeCatch(i)} className="text-blue-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <select
                value={newCatch.species}
                onChange={(e) => setNewCatch({ ...newCatch, species: e.target.value })}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-700"
              >
                <option value="">Vælg art</option>
                {FISH_SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                placeholder="kg"
                value={newCatch.weight}
                onChange={(e) => setNewCatch({ ...newCatch, weight: e.target.value })}
                className="w-20 text-sm border border-gray-200 rounded-xl px-3 py-2"
              />
              <button
                onClick={addCatch}
                className="bg-blue-600 text-white rounded-xl px-3 py-2 text-sm font-medium"
              >
                Tilføj
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Noter (valgfrit)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Hvad skete der på turen..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none"
            />
          </div>

          <ErrorMessage message={error} />
          <Button loading={loading} onClick={handleSubmit}>Gem post</Button>
        </div>
      </div>
    </div>
  )
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [showCreate, setShowCreate] = useState(false)

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

  useEffect(() => { load() }, [])

  return (
    <div className="pb-24">
      <PageHeader
        title="Journal"
        right={
          <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white rounded-xl p-2">
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-4 py-4">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl">📒</span>
            <p className="mt-3 text-sm">Ingen logbogsindlæg endnu</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-sm text-blue-600 font-medium"
            >
              Tilføj din første tur
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl border shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
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
                        <Fish size={10} /> {c.species}{c.weight ? ` · ${c.weight}kg` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {e.notes && (
                  <p className="text-xs text-gray-500 line-clamp-2">{e.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateJournalModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}

      <BottomNav />
    </div>
  )
}
