'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fish, MapPin, Calendar, Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FISHING_TYPES, FISH_SPECIES } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Button, ErrorMessage } from '@/components/AuthForm'
import BottomNav from '@/components/BottomNav'

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    trip_type: 'samkørsel',
    fishing_type: '',
    fish_species: [],
    destination: '',
    departure_location: '',
    trip_date: '',
    trip_time: '',
    max_participants: 3,
    is_free: true,
    price_per_person: 0,
  })

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleSpecies(s) {
    setForm(prev => ({
      ...prev,
      fish_species: prev.fish_species.includes(s)
        ? prev.fish_species.filter(x => x !== s)
        : [...prev.fish_species, s],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.fishing_type) {
      setError('Vælg venligst en vandtype')
      return
    }
    if (!form.trip_date) {
      setError('Vælg venligst en dato')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Du skal logge ind for at oprette en tur')
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase.from('trips').insert({
      creator_id: user.id,
      title: form.title,
      description: form.description,
      trip_type: form.trip_type,
      fishing_type: form.fishing_type,
      fish_species: form.fish_species,
      destination: form.destination,
      departure_location: form.trip_type === 'samkørsel' ? form.departure_location : null,
      trip_date: form.trip_date,
      trip_time: form.trip_time || null,
      max_participants: form.max_participants,
      is_free: form.is_free,
      price_per_person: form.is_free ? 0 : form.price_per_person,
    }).select().single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/trips/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Opret fisketur" backHref="/trips" />

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        <ErrorMessage message={error} />

        {/* Trip type */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Turtype</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'samkørsel', label: '🚗 Samkørsel', desc: 'Del køreturen' },
              { value: 'meetup', label: '⚓ Mødested', desc: 'Mød op selv' },
            ].map(opt => (
              <label key={opt.value} className={`block p-3 rounded-xl border-2 cursor-pointer transition ${
                form.trip_type === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <input type="radio" name="trip_type" className="sr-only" value={opt.value} checked={form.trip_type === opt.value} onChange={e => update('trip_type', e.target.value)} />
                <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-gray-700">Turoplysninger</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Titel</label>
            <input
              type="text"
              placeholder="f.eks. Torskefiskeri fra molen i Skagen"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Beskrivelse (valgfri)</label>
            <textarea
              placeholder="Beskriv turen, udstyr du bruger, hvad du fisker efter..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <MapPin size={12} className="inline mr-1" />
              Destination
            </label>
            <input
              type="text"
              placeholder="f.eks. Skagen Havn, Randers Fjord"
              value={form.destination}
              onChange={e => update('destination', e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {form.trip_type === 'samkørsel' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Afrejsested</label>
              <input
                type="text"
                placeholder="f.eks. Aarhus C, ved Rådhuset"
                value={form.departure_location}
                onChange={e => update('departure_location', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Dato
              </label>
              <input
                type="date"
                value={form.trip_date}
                onChange={e => update('trip_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Clock size={12} className="inline mr-1" />
                Tidspunkt
              </label>
              <input
                type="time"
                value={form.trip_time}
                onChange={e => update('trip_time', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Users size={12} className="inline mr-1" />
              Max deltagere: {form.max_participants}
            </label>
            <input
              type="range"
              min={2}
              max={10}
              value={form.max_participants}
              onChange={e => update('max_participants', parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>2</span><span>10</span>
            </div>
          </div>
        </div>

        {/* Fishing type */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Vandtype</p>
          <div className="grid grid-cols-3 gap-2">
            {FISHING_TYPES.map(ft => (
              <label key={ft.value} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 cursor-pointer transition ${
                form.fishing_type === ft.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <input type="radio" name="fishing_type" className="sr-only" value={ft.value} checked={form.fishing_type === ft.value} onChange={() => update('fishing_type', ft.value)} />
                <span className="text-xl">{ft.icon}</span>
                <span className="text-xs font-medium text-gray-700 text-center">{ft.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fish species */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Målarter (valgfri)</p>
          <div className="flex flex-wrap gap-2">
            {FISH_SPECIES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecies(s)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                  form.fish_species.includes(s)
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Pris</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={e => update('is_free', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600">Gratis</span>
            </label>
          </div>
          {!form.is_free && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Pris pr. person (kr.)</label>
              <input
                type="number"
                min={0}
                step={10}
                value={form.price_per_person}
                onChange={e => update('price_per_person', parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <Button type="submit" loading={loading}>
          <Fish size={18} className="inline mr-2" />
          Opret fisketur
        </Button>

        <div className="h-4" />
      </form>

      <BottomNav />
    </div>
  )
}
