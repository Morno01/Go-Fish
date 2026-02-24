export const FISHING_TYPES = [
  { id: 'hav', label: 'Hav', icon: '🌊' },
  { id: 'soe', label: 'Sø', icon: '🏞️' },
  { id: 'aa', label: 'Å / Flod', icon: '🏔️' },
  { id: 'put-take', label: 'Put & Take', icon: '🎯' },
  { id: 'mole', label: 'Mole', icon: '⚓' },
  { id: 'baad', label: 'Båd', icon: '⛵' },
]

export const FISH_SPECIES = [
  'Torsk', 'Havbars', 'Hornfisk', 'Makrel', 'Ørred', 'Laks',
  'Gedde', 'Aborre', 'Sandart', 'Brasen', 'Karpe', 'Ål',
  'Rødspætte', 'Pighvar', 'Havørred', 'Regnbueørred', 'Knude',
]

export const DANISH_REGIONS = [
  'Sjælland', 'Fyn', 'Jylland Nord', 'Jylland Midt', 'Jylland Syd', 'Bornholm',
]

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Begynder' },
  { id: 'intermediate', label: 'Øvet' },
  { id: 'expert', label: 'Ekspert' },
]

export const MOON_PHASES = [
  { id: 'new', label: 'Nymåne' },
  { id: 'waxing', label: 'Tiltagende' },
  { id: 'full', label: 'Fuldmåne' },
  { id: 'waning', label: 'Aftagende' },
]

export const TIDE_OPTIONS = [
  { id: 'rising', label: 'Stigende' },
  { id: 'high', label: 'Højvande' },
  { id: 'falling', label: 'Faldende' },
  { id: 'low', label: 'Lavvande' },
]

export const PRESSURE_OPTIONS = [
  { id: 'rising', label: 'Stigende' },
  { id: 'stable', label: 'Stabilt' },
  { id: 'falling', label: 'Faldende' },
  { id: 'low', label: 'Lavt' },
]

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function tripTypeLabel(type) {
  return type === 'samkoersel' ? 'Samkørsel' : 'Mødested'
}

export function tripTypeBadgeColor(type) {
  return type === 'samkoersel'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-green-100 text-green-700'
}
