'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fish } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input, Button, ErrorMessage, SuccessMessage } from '@/components/AuthForm'
import { FISHING_TYPES, FISH_SPECIES, DANISH_REGIONS } from '@/lib/utils'

const STEPS = ['Konto', 'Fiskeri', 'Områder']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    fishing_types: [],
    fish_species: [],
    regions: [],
    has_boat: false,
    has_car: false,
  })

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleArray(key, value) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          full_name: form.full_name,
        },
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Update profile with fishing preferences
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        username: form.username,
        full_name: form.full_name,
        fishing_types: form.fishing_types,
        fish_species: form.fish_species,
        regions: form.regions,
        has_boat: form.has_boat,
        has_car: form.has_car,
      })
    }

    setSuccess('Konto oprettet! Tjek din e-mail for at bekræfte din konto.')
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-500 flex flex-col">
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <Fish size={28} className="text-white" strokeWidth={2} />
          <span className="text-white font-bold text-2xl">Go-Fish</span>
        </Link>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? 'bg-teal-400 text-white' : i === step ? 'bg-white text-blue-700' : 'bg-white/30 text-white'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${i < step ? 'bg-teal-400' : 'bg-white/30'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-blue-100 text-xs mt-2">{STEPS[step]}</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-12 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {step === 0 ? 'Opret konto' : step === 1 ? 'Dine fiskeinteresser' : 'Dine fiskeområder'}
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          {step === 0 ? 'Udfyld dine oplysninger' : step === 1 ? 'Hvad fisker du efter?' : 'Hvilke regioner fisker du i?'}
        </p>

        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <form onSubmit={step < 2 ? (e) => { e.preventDefault(); setStep(s => s + 1) } : handleRegister} className="space-y-4">
          {step === 0 && (
            <>
              <Input
                label="Fulde navn"
                id="full_name"
                placeholder="Jens Hansen"
                value={form.full_name}
                onChange={e => updateForm('full_name', e.target.value)}
                required
              />
              <Input
                label="Brugernavn"
                id="username"
                placeholder="fiskerjens"
                value={form.username}
                onChange={e => updateForm('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                required
              />
              <Input
                label="E-mail"
                id="email"
                type="email"
                placeholder="din@email.dk"
                value={form.email}
                onChange={e => updateForm('email', e.target.value)}
                required
              />
              <Input
                label="Adgangskode (min. 6 tegn)"
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => updateForm('password', e.target.value)}
                minLength={6}
                required
              />
            </>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Vandtype</p>
                <div className="grid grid-cols-2 gap-2">
                  {FISHING_TYPES.map(ft => (
                    <label key={ft.value} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                      form.fishing_types.includes(ft.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input type="checkbox" className="sr-only" checked={form.fishing_types.includes(ft.value)} onChange={() => toggleArray('fishing_types', ft.value)} />
                      <span className="text-lg">{ft.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{ft.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Målarter</p>
                <div className="flex flex-wrap gap-2">
                  {FISH_SPECIES.map(species => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => toggleArray('fish_species', species)}
                      className={`text-sm px-3 py-1.5 rounded-full border font-medium transition ${
                        form.fish_species.includes(species)
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.has_car} onChange={e => updateForm('has_car', e.target.checked)} />
                  <span className="text-sm text-gray-700">Jeg har bil og kan tilbyde samkørsel</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.has_boat} onChange={e => updateForm('has_boat', e.target.checked)} />
                  <span className="text-sm text-gray-700">Jeg har en båd</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Vælg de regioner du typisk fisker i:</p>
              {DANISH_REGIONS.map(region => (
                <label key={region} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  form.regions.includes(region) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input type="checkbox" className="sr-only" checked={form.regions.includes(region)} onChange={() => toggleArray('regions', region)} />
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    form.regions.includes(region) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {form.regions.includes(region) && <span className="text-white text-xs font-bold">✓</span>}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{region}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                Tilbage
              </Button>
            )}
            <Button type="submit" loading={step === 2 && loading} className="flex-1">
              {step < 2 ? 'Næste' : 'Opret konto'}
            </Button>
          </div>
        </form>

        <p className="text-center text-gray-500 text-sm mt-5">
          Har du allerede en konto?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log ind</Link>
        </p>
      </div>
    </div>
  )
}
