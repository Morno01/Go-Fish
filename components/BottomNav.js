'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Fish, Heart, MessageCircle, BookOpen, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Map, label: 'Kort' },
  { href: '/trips', icon: Fish, label: 'Ture' },
  { href: '/match', icon: Heart, label: 'Match' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-1 rounded-lg transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
