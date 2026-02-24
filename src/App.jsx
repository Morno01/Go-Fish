import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import Match from './pages/Match'
import Chat from './pages/Chat'
import Journal from './pages/Journal'
import Profile from './pages/Profile'

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
