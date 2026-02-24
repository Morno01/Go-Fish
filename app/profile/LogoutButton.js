'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-red-50 transition text-left"
    >
      <LogOut size={18} className="text-red-400" />
      <span className="text-sm text-red-500 font-medium">Log ud</span>
    </button>
  )
}
