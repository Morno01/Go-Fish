'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fish } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input, Button, ErrorMessage } from '@/components/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Forkert e-mail eller adgangskode'
        : err.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-500 flex flex-col">
      {/* Top */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <Fish size={32} className="text-white" strokeWidth={2} />
          <span className="text-white font-bold text-3xl">Go-Fish</span>
        </Link>
        <p className="text-blue-100 text-sm">Log ind og find din næste fisketur</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Velkommen tilbage</h2>
        <p className="text-gray-500 text-sm mb-6">Log ind på din konto</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="E-mail"
            id="email"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Adgangskode"
            id="password"
            type="password"
            placeholder="Din adgangskode"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <ErrorMessage message={error} />

          <Button type="submit" loading={loading}>
            Log ind
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Har du ikke en konto?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Tilmeld dig gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
