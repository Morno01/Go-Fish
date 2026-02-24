import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, backHref, action }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
        {backHref && (
          <Link href={backHref} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
        )}
        <h1 className="flex-1 font-semibold text-gray-900 text-lg">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}
