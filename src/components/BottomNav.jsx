import { useLocation, Link } from 'react-router-dom'
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
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
