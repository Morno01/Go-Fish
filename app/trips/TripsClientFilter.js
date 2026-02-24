'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FISHING_TYPES } from '@/lib/utils'

export default function TripsClientFilter({ currentType, currentFishing }) {
  const router = useRouter()

  function setFilter(type, fishing) {
    const params = new URLSearchParams()
    if (type && type !== 'all') params.set('type', type)
    if (fishing) params.set('fishing', fishing)
    router.push(`/trips?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Trip type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {[
          { value: 'all', label: 'Alle ture' },
          { value: 'samkørsel', label: '🚗 Samkørsel' },
          { value: 'meetup', label: '⚓ Mødested' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value, currentFishing)}
            className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition ${
              currentType === opt.value || (opt.value === 'all' && !currentType)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Fishing type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        <button
          onClick={() => setFilter(currentType, '')}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
            !currentFishing ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          Alle vandtyper
        </button>
        {FISHING_TYPES.map(ft => (
          <button
            key={ft.value}
            onClick={() => setFilter(currentType, ft.value)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
              currentFishing === ft.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            <span>{ft.icon}</span>
            {ft.label}
          </button>
        ))}
      </div>
    </div>
  )
}
