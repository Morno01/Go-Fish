import { MapPin, Calendar, Users, Car, Anchor } from 'lucide-react'
import { tripTypeLabel, tripTypeBadgeColor, formatDate } from '../lib/utils'

export default function TripCard({ trip }) {
  const isFull = trip.max_participants && trip.participants_count >= trip.max_participants

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${isFull ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{trip.title}</h3>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${tripTypeBadgeColor(trip.trip_type)}`}>
          {trip.trip_type === 'samkoersel' ? <Car size={11} /> : <Anchor size={11} />}
          {tripTypeLabel(trip.trip_type)}
        </span>
      </div>

      {trip.profiles?.username && (
        <p className="text-xs text-gray-400 mb-2">af @{trip.profiles.username}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        {trip.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {trip.location}
          </span>
        )}
        {trip.date && (
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {formatDate(trip.date)}
          </span>
        )}
        {trip.max_participants && (
          <span className="flex items-center gap-1">
            <Users size={11} /> {trip.participants_count ?? 0}/{trip.max_participants}
            {isFull && ' · Fuldt booket'}
          </span>
        )}
      </div>

      {trip.fishing_types?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {trip.fishing_types.map((t) => (
            <span key={t} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
          {trip.target_species?.map((s) => (
            <span key={s} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
