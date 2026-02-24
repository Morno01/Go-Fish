'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/PageHeader'
import { Button, ErrorMessage } from '@/components/AuthForm'
import BottomNav from '@/components/BottomNav'
import { FISHING_TYPES, FISH_SPECIES, MOON_PHASES, TIDE_OPTIONS, PRESSURE_OPTIONS } from '@/lib/utils'
import { Plus, X, MapPin, Crosshair } from 'lucide-react'

export default function CreateJournalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    location: '',
    latitude: '',
    longitude: '',
    fishing_date: new Date().toISOString().split('T')[0],
    fishing_type: '',
    fish_caught: [],
    weather: '',
    wind_speed: '',
    wind_direction: '',
    temperature: '',
    water_temp: '',
    moon_phase: '',
    tide: '',
    pressure: '',
    notes: '',
    is_public: true,
    gear_used: [],
  })

  const [newFish, setNewFish] = useState('')
  const [newGear, setNewGear] = useState({ type: '', size: '', brand: '' })

  function update(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function addFish() {
    if (!newFish.trim()) return
    setForm(prev => ({ ...prev, fish_caught: [...prev.fish_caught, newFish.trim()] }))
    setNewFish('')
  }

  function removeFish(i) {
    setForm(prev => ({ ...prev, fish_caught: prev.fish_caught.filter((_, idx) => idx !== i) }))
  }

  function addGear() {
    if (!newGear.type) return
    setForm(prev => ({ ...prev, gear_used: [...prev.gear_used, { ...newGear }] }))
    setNewGear({ type: '', size: '', brand: '' })
  }

  function removeGear(i) {
    setForm(prev => ({ ...prev, gear_used: prev.gear_used.filter((_, idx) => idx !== i) }))
  }

  function getGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        update('latitude', pos.coords.latitude.toFixed(6))
        update('longitude', pos.coords.longitude.toFixed(6))
        setGpsLoading(false)
      },
      () => setGpsLoading(false)
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Ikke logget ind'); setLoading(false); return }

    const { data, error: err } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: form.title,
      location: form.location || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      fishing_date: form.fishing_date,
      fishing_type: form.fishing_type || null,
      fish_caught: form.fish_caught,
      weather: form.weather || null,
      wind_speed: form.wind_speed || null,
      wind_direction: form.wind_direction || null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      water_temp: form.water_temp ? parseFloat(form.water_temp) : null,
      moon_phase: form.moon_phase || null,
      tide: form.tide || null,
      pressure: form.pressure || null,
      notes: form.notes || null,
      gear_used: form.gear_used,
      is_public: form.is_public,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/journal/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="Ny journallog" backHref="/journal" />

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <ErrorMessage message={error} />

        {/* Basic */}
        <Section title="Grundoplysninger">
          <Field label="Titel">
            <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="f.eks. Havørred ved Odense Å" required className={inputCls} />
          </Field>
          <Field label="Dato">
            <input type="date" value={form.fishing_date} onChange={e => update('fishing_date', e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Lokalitet">
            <input type="text" value={form.location} onChange={e => update('location', e.target.value)} placeholder="f.eks. Odense Å, Fraugde" className={inputCls} />
          </Field>
          <Field label="GPS koordinater">
            <div className="flex gap-2">
              <input type="number" step="any" value={form.latitude} onChange={e => update('latitude', e.target.value)} placeholder="Breddegrad" className={`${inputCls} flex-1`} />
              <input type="number" step="any" value={form.longitude} onChange={e => update('longitude', e.target.value)} placeholder="Længdegrad" className={`${inputCls} flex-1`} />
              <button type="button" onClick={getGPS} disabled={gpsLoading} className="shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition">
                {gpsLoading ? <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin inline-block" /> : <Crosshair size={16} />}
              </button>
            </div>
          </Field>
          <Field label="Vandtype">
            <div className="grid grid-cols-3 gap-1.5">
              {FISHING_TYPES.map(ft => (
                <label key={ft.value} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer transition text-xs ${form.fishing_type === ft.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="fishing_type" className="sr-only" value={ft.value} checked={form.fishing_type === ft.value} onChange={() => update('fishing_type', ft.value)} />
                  <span className="text-base">{ft.icon}</span>
                  <span className="font-medium text-gray-700 text-center leading-tight">{ft.label}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        {/* Fish caught */}
        <Section title="Fangster">
          <div className="flex flex-wrap gap-2 mb-2">
            {form.fish_caught.map((f, i) => (
              <span key={i} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-sm px-2.5 py-1 rounded-full">
                {f}
                <button type="button" onClick={() => removeFish(i)}><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={newFish} onChange={e => setNewFish(e.target.value)} className={`${inputCls} flex-1`}>
              <option value="">Vælg art...</option>
              {FISH_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" onClick={addFish} className="px-3 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* Weather & conditions */}
        <Section title="Vejr & forhold">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vejr">
              <select value={form.weather} onChange={e => update('weather', e.target.value)} className={inputCls}>
                <option value="">Vælg...</option>
                {['Klart', 'Overskyet', 'Let skyet', 'Regn', 'Tåge', 'Sne', 'Blæsende'].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Lufttemperatur (°C)">
              <input type="number" step="0.5" value={form.temperature} onChange={e => update('temperature', e.target.value)} placeholder="15" className={inputCls} />
            </Field>
            <Field label="Vandtemperatur (°C)">
              <input type="number" step="0.5" value={form.water_temp} onChange={e => update('water_temp', e.target.value)} placeholder="12" className={inputCls} />
            </Field>
            <Field label="Vindstyrke">
              <input type="text" value={form.wind_speed} onChange={e => update('wind_speed', e.target.value)} placeholder="10 m/s" className={inputCls} />
            </Field>
            <Field label="Vindretning">
              <select value={form.wind_direction} onChange={e => update('wind_direction', e.target.value)} className={inputCls}>
                <option value="">Vælg...</option>
                {['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Lufttryk">
              <select value={form.pressure} onChange={e => update('pressure', e.target.value)} className={inputCls}>
                <option value="">Vælg...</option>
                {PRESSURE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Tidevand">
              <select value={form.tide} onChange={e => update('tide', e.target.value)} className={inputCls}>
                <option value="">Vælg...</option>
                {TIDE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Månefase">
              <select value={form.moon_phase} onChange={e => update('moon_phase', e.target.value)} className={inputCls}>
                <option value="">Vælg...</option>
                {MOON_PHASES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Gear */}
        <Section title="Grej & udstyr">
          {form.gear_used.map((g, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl mb-2">
              <span className="text-sm text-gray-700 flex-1">{g.type} {g.size && `(${g.size})`} {g.brand && `- ${g.brand}`}</span>
              <button type="button" onClick={() => removeGear(i)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input type="text" placeholder="Type (f.eks. Wobbler)" value={newGear.type} onChange={e => setNewGear(p => ({ ...p, type: e.target.value }))} className={inputCls} />
            <input type="text" placeholder="Størrelse" value={newGear.size} onChange={e => setNewGear(p => ({ ...p, size: e.target.value }))} className={inputCls} />
            <input type="text" placeholder="Mærke" value={newGear.brand} onChange={e => setNewGear(p => ({ ...p, brand: e.target.value }))} className={inputCls} />
          </div>
          <button type="button" onClick={addGear} className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition">
            <Plus size={14} /> Tilføj grej
          </button>
        </Section>

        {/* Notes */}
        <Section title="Noter">
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Skriv noter om turen, hvad der virkede, tips til næste gang..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => update('is_public', e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm text-gray-600">Del i fællesskabet (offentlig log)</span>
          </label>
        </Section>

        <Button type="submit" loading={loading}>
          Gem journallog
        </Button>
        <div className="h-4" />
      </form>

      <BottomNav />
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
