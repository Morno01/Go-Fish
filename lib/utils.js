export const FISHING_TYPES = [
  { value: 'hav', label: 'Hav', icon: '🌊' },
  { value: 'sø', label: 'Sø', icon: '💧' },
  { value: 'å', label: 'Å / Flod', icon: '🏞️' },
  { value: 'put_and_take', label: 'Put & Take', icon: '🎣' },
  { value: 'mole', label: 'Mole / Havn', icon: '⚓' },
  { value: 'båd', label: 'Bådfiskeri', icon: '⛵' },
]

export const FISH_SPECIES = [
  'Ørred', 'Laks', 'Gedde', 'Aborre', 'Sandart', 'Torsk',
  'Havørred', 'Regnbueørred', 'Brasen', 'Skalle', 'Hornfisk',
  'Makrel', 'Rødspætte', 'Ål', 'Karpe', 'Zander', 'Pighaj',
]

export const DANISH_REGIONS = [
  'Nordjylland', 'Midtjylland', 'Syddanmark',
  'Sjælland', 'Hovedstaden', 'Bornholm',
]

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Nybegynder' },
  { value: 'intermediate', label: 'Øvet' },
  { value: 'expert', label: 'Ekspert' },
]

export const MOON_PHASES = [
  'Nymåne', 'Voksende halvmåne', 'Fuldmåne', 'Aftagende halvmåne',
]

export const TIDE_OPTIONS = [
  'Flod (stigende)', 'Ebbe (faldende)', 'Højvande', 'Lavvande',
]

export const PRESSURE_OPTIONS = [
  'Højtryk', 'Lavtryk', 'Stationært', 'Skiftende',
]

export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function tripTypeLabel(type) {
  return type === 'samkørsel' ? 'Samkørsel' : 'Mødested'
}

export function tripTypeBadgeColor(type) {
  return type === 'samkørsel'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-teal-100 text-teal-700'
}
