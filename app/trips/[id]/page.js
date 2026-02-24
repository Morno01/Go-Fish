import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, Users, Fish, Car, Anchor, Clock, MessageCircle } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import PageHeader from '@/components/PageHeader'
import { formatDate, tripTypeLabel } from '@/lib/utils'
import JoinTripButton from './JoinTripButton'

export default async function TripDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: trip } = await supabase
    .from('trips')
    .select('*, profiles(id, username, full_name, avatar_url, experience_level)')
    .eq('id', id)
    .single()

  if (!trip) notFound()

  const { data: participants } = await supabase
    .from('trip_participants')
    .select('*, profiles(username, avatar_url)')
    .eq('trip_id', id)
    .eq('status', 'accepted')

  const isCreator = trip.creator_id === user.id
  const isParticipant = participants?.some(p => p.user_id === user.id)
  const isFull = trip.current_participants >= trip.max_participants

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader
        title="Turdetaljer"
        backHref="/trips"
        action={
          isCreator ? (
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Din tur</span>
          ) : null
        }
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Hero card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className={`p-5 ${trip.trip_type === 'samkørsel' ? 'bg-blue-600' : 'bg-teal-600'}`}>
            <div className="flex items-center gap-2 mb-2">
              {trip.trip_type === 'samkørsel'
                ? <Car size={18} className="text-white/80" />
                : <Anchor size={18} className="text-white/80" />}
              <span className="text-white/80 text-sm font-medium">{tripTypeLabel(trip.trip_type)}</span>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight">{trip.title}</h1>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={16} className="text-blue-500 shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{trip.destination}</p>
                {trip.departure_location && (
                  <p className="text-xs text-gray-400 mt-0.5">Fra: {trip.departure_location}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar size={16} className="text-blue-500 shrink-0" />
              <span>{formatDate(trip.trip_date)}</span>
              {trip.trip_time && (
                <>
                  <Clock size={14} className="text-gray-300" />
                  <span>{trip.trip_time.slice(0, 5)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users size={16} className="text-blue-500 shrink-0" />
              <span>
                {trip.current_participants} / {trip.max_participants} deltagere
                {isFull && <span className="ml-2 text-red-500 font-medium text-xs">(Fuldt)</span>}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Fish size={16} className="text-blue-500 shrink-0" />
              <span className="capitalize">{trip.fishing_type}</span>
              {trip.fish_species?.length > 0 && (
                <span className="text-gray-400">· {trip.fish_species.join(', ')}</span>
              )}
            </div>

            {!trip.is_free && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm">
                <span className="font-semibold text-amber-700">Pris: {trip.price_per_person} kr. pr. person</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-2">Beskrivelse</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{trip.description}</p>
          </div>
        )}

        {/* Creator */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Turarrangør</h2>
          <Link href={`/profile/${trip.profiles?.id}`} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {trip.profiles?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{trip.profiles?.full_name || trip.profiles?.username}</p>
              <p className="text-sm text-gray-500">@{trip.profiles?.username}</p>
            </div>
            <MessageCircle size={18} className="text-gray-300 ml-auto" />
          </Link>
        </div>

        {/* Participants */}
        {participants && participants.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Deltagere ({participants.length})</h2>
            <div className="flex gap-2 flex-wrap">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {p.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{p.profiles?.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join button */}
        {!isCreator && (
          <JoinTripButton
            tripId={trip.id}
            userId={user.id}
            creatorId={trip.creator_id}
            isParticipant={isParticipant}
            isFull={isFull}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
