import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Fish } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input, Button, ErrorMessage } from '../components/AuthForm'
import { FISHING_TYPES, FISH_SPECIES, DANISH_REGIONS } from '../lib/utils'

export default function Register() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '',
    fishingTypes: [], targetSpecies: [], hasBoat: false, hasCar: false,
    regions: [],
  })

  function toggle(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((x) => x !== value)
        : [...f[field], value],
    }))
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    const userId = data.user?.id
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: form.fullName,
        username: form.username,
        fishing_types: form.fishingTypes,
        target_species: form.targetSpecies,
        has_boat: form.hasBoat,
        has_car: form.hasCar,
        regions: form.regions,
      })
    }
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-2xl mb-8">
          <Fish size={28} /> Go-Fish
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`flex-1 h-1.5 rounded-full ${n <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Opret konto</h2>
              <div className="flex flex-col gap-4">
                <Input label="Navn" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Dit fulde navn" />
                <Input label="Brugernavn" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="@brugernavn" />
                <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="din@email.dk" />
                <Input label="Adgangskode" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 tegn" />
              </div>
              <Button className="mt-5" onClick={() => setStep(2)}>Næste</Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Dine interesser</h2>
              <p className="text-sm text-gray-500 mb-4">Hvilke typer fiskeri kan du lide?</p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {FISHING_TYPES.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => toggle('fishingTypes', id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.fishingTypes.includes(id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">Målarter</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {FISH_SPECIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle('targetSpecies', s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.targetSpecies.includes(s)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mb-4">
                {[['hasBoat', '⛵ Båd'], ['hasCar', '🚗 Bil']].map(([field, label]) => (
                  <button
                    key={field}
                    onClick={() => setForm({ ...form, [field]: !form[field] })}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form[field] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Tilbage</Button>
                <Button onClick={() => setStep(3)}>Næste</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Dit område</h2>
              <p className="text-sm text-gray-500 mb-4">Vælg de regioner du fisker i</p>

              <div className="flex flex-col gap-2 mb-5">
                {DANISH_REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggle('regions', r)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
                      form.regions.includes(r)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <ErrorMessage message={error} />
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Tilbage</Button>
                <Button loading={loading} onClick={handleSubmit}>Opret konto</Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Har du allerede en konto?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Log ind</Link>
        </p>
      </div>
    </div>
  )
}
