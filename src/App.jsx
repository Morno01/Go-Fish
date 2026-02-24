import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, supabaseMissing } from './lib/supabase'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import Match from './pages/Match'
import Chat from './pages/Chat'
import Journal from './pages/Journal'
import Profile from './pages/Profile'

function SetupScreen() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 max-w-sm w-full">
        <div className="text-4xl mb-4 text-center">🎣</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Go-Fish opsætning</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Mangler Supabase konfiguration. Opret filen <code className="bg-gray-100 px-1 rounded">.env.local</code> i projektmappen.
        </p>
        <div className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 font-mono leading-relaxed">
          <p className="text-gray-400 mb-1"># .env.local</p>
          <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=din-nøgle</p>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Find nøglerne på <strong>supabase.com</strong> → dit projekt → Settings → API
        </p>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Genstart <code className="bg-gray-100 px-1 rounded">npm run dev</code> efter du har oprettet filen.
        </p>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
  }, [])

  if (user === undefined) return <div className="min-h-screen flex items-center justify-center text-gray-400">Indlæser...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
  }, [])

  if (user === undefined) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  if (supabaseMissing) return <SetupScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={
          <PublicOnlyRoute><Login /></PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute><Register /></PublicOnlyRoute>
        } />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trips" element={<PrivateRoute><Trips /></PrivateRoute>} />
        <Route path="/match" element={<PrivateRoute><Match /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
