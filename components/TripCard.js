import Link from 'next/link'
import { MapPin, Calendar, Users, Car, Anchor } from 'lucide-react'
import { formatDate, tripTypeLabel, tripTypeBadgeColor } from '@/lib/utils'

export default function TripCard({ trip }) {
  const badgeColor = tripTypeBadgeColor(trip.trip_type)
  const isFull = trip.current_participants >= trip.max_participants

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow active:scale-[0.99]">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">{trip.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              af {trip.profiles?.username || 'Ukendt'}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {trip.trip_type === 'samkørsel' ? <span className="flex items-center gap-1"><Car size={11} />{tripTypeLabel(trip.trip_type)}</span> : <span className="flex items-center gap-1"><Anchor size={11} />{tripTypeLabel(trip.trip_type)}</span>}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <span>{formatDate(trip.trip_date)}{trip.trip_time ? ` kl. ${trip.trip_time.slice(0, 5)}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} className="text-blue-500 shrink-0" />
            <span>{trip.current_participants} / {trip.max_participants} deltagere</span>
            {isFull && (
              <span className="ml-auto text-xs font-medium text-red-500">Fuldt booket</span>
            )}
          </div>
        </div>

        {/* Fishing type tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            {trip.fishing_type}
          </span>
          {trip.fish_species?.slice(0, 2).map(f => (
            <span key={f} className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
