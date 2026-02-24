import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Fish } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input, Button, ErrorMessage } from '../components/AuthForm'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('Forkert e-mail eller adgangskode')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-2xl mb-8">
          <Fish size={28} /> Go-Fish
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Log ind</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.dk"
              required
            />
            <Input
              label="Adgangskode"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <ErrorMessage message={error} />
            <Button type="submit" loading={loading}>Log ind</Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ikke oprettet endnu?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Tilmeld dig her
          </Link>
        </p>
      </div>
    </div>
  )
}
