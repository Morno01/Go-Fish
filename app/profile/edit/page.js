'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/PageHeader'
import { Button, ErrorMessage, SuccessMessage } from '@/components/AuthForm'
import BottomNav from '@/components/BottomNav'
import { FISHING_TYPES, FISH_SPECIES, DANISH_REGIONS, EXPERIENCE_LEVELS } from '@/lib/utils'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    experience_level: 'beginner',
    has_boat: false,
    has_car: false,
    fishing_types: [],
    fish_species: [],
    regions: [],
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setForm({
          username: profile.username || '',
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          experience_level: profile.experience_level || 'beginner',
          has_boat: profile.has_boat || false,
          has_car: profile.has_car || false,
          fishing_types: profile.fishing_types || [],
          fish_species: profile.fish_species || [],
          regions: profile.regions || [],
        })
      }
      setFetchLoading(false)
    }
    load()
  }, [router])

  function update(key, val) { setForm(prev => ({ ...prev, [key]: val })) }
  function toggleArr(key, val) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(x => x !== val) : [...prev[key], val]
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await supabase.from('profiles').update({
      ...form,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (err) {
      setError(err.message)
    } else {
      setSuccess('Profil opdateret!')
      setTimeout(() => router.push('/profile'), 1000)
    }
    setLoading(false)
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400'

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="Rediger profil" backHref="/profile" />

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        {/* Personal */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">Personlige oplysninger</p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Fulde navn</label>
            <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} className={inputCls} placeholder="Jens Hansen" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Brugernavn</label>
            <input type="text" value={form.username} onChange={e => update('username', e.target.value.toLowerCase())} className={inputCls} placeholder="fiskerjens" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Lokation</label>
            <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className={inputCls} placeholder="Aarhus, Danmark" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Biografi</label>
            <textarea value={form.bio} onChange={e => update('bio', e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Fortæl lidt om dig selv og dine fiskeinteresser..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Erfaring</label>
            <div className="flex gap-2">
              {EXPERIENCE_LEVELS.map(level => (
                <label key={level.value} className={`flex-1 text-center py-2 rounded-xl border-2 cursor-pointer text-sm font-medium transition ${form.experience_level === level.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  <input type="radio" name="experience_level" className="sr-only" value={level.value} checked={form.experience_level === level.value} onChange={() => update('experience_level', level.value)} />
                  {level.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl border border-gray-200 cursor-pointer">
              <input type="checkbox" checked={form.has_car} onChange={e => update('has_car', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-600">🚗 Har bil</span>
            </label>
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl border border-gray-200 cursor-pointer">
              <input type="checkbox" checked={form.has_boat} onChange={e => update('has_boat', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-600">⛵ Har båd</span>
            </label>
          </div>
        </div>

        {/* Fishing types */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Vandtype</p>
          <div className="grid grid-cols-2 gap-2">
            {FISHING_TYPES.map(ft => (
              <label key={ft.value} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition ${form.fishing_types.includes(ft.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="checkbox" className="sr-only" checked={form.fishing_types.includes(ft.value)} onChange={() => toggleArr('fishing_types', ft.value)} />
                <span>{ft.icon}</span>
                <span className="text-sm font-medium text-gray-700">{ft.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fish species */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Målarter</p>
          <div className="flex flex-wrap gap-2">
            {FISH_SPECIES.map(s => (
              <button key={s} type="button" onClick={() => toggleArr('fish_species', s)} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${form.fish_species.includes(s) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Fiskeregioner</p>
          <div className="space-y-2">
            {DANISH_REGIONS.map(r => (
              <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${form.regions.includes(r) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="checkbox" className="sr-only" checked={form.regions.includes(r)} onChange={() => toggleArr('regions', r)} />
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${form.regions.includes(r) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                  {form.regions.includes(r) && <span className="text-white text-xs font-bold">✓</span>}
                </span>
                <span className="text-sm font-medium text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading}>Gem ændringer</Button>
        <div className="h-4" />
      </form>

      <BottomNav />
    </div>
  )
}
