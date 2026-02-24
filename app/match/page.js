import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import SwipeCard from './SwipeCard'

export default async function MatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('fishing_types, regions, fish_species')
    .eq('id', user.id)
    .single()

  // Get profiles not yet swiped on
  const { data: swiped } = await supabase
    .from('matches')
    .select('target_id')
    .eq('user_id', user.id)

  const swipedIds = swiped?.map(s => s.target_id) || []
  const excludeIds = [...swipedIds, user.id]

  let query = supabase
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(20)

  const { data: candidates } = await query

  // Get my confirmed matches (both swiped right on each other)
  const { data: myLikes } = await supabase
    .from('matches')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('action', 'like')

  const myLikedIds = myLikes?.map(m => m.target_id) || []

  let myMatches = []
  if (myLikedIds.length > 0) {
    const { data: theirLikes } = await supabase
      .from('matches')
      .select('user_id, profiles!matches_user_id_fkey(id, username, full_name, avatar_url, fishing_types, fish_species)')
      .in('user_id', myLikedIds)
      .eq('target_id', user.id)
      .eq('action', 'like')
    myMatches = theirLikes || []
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-700 pt-10 pb-4 px-6">
        <h1 className="text-white font-bold text-xl">Match</h1>
        <p className="text-blue-200 text-sm">Find din fiskepartner</p>
      </div>

      <SwipeCard candidates={candidates || []} userId={user.id} myMatches={myMatches} />

      <BottomNav />
    </div>
  )
}
