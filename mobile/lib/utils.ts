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

export const WEATHER_OPTIONS = [
  'Klart', 'Overskyet', 'Let skyet', 'Regn', 'Tåge', 'Sne', 'Blæsende',
]

export const WIND_DIRECTIONS = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV']

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
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

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export function tripTypeLabel(type: string): string {
  return type === 'samkørsel' ? 'Samkørsel' : 'Mødested'
}

export function tripTypeBadgeColor(type: string): { bg: string; text: string } {
  return type === 'samkørsel'
    ? { bg: '#dbeafe', text: '#1d4ed8' }
    : { bg: '#ccfbf1', text: '#0d9488' }
}

export function getFishingTypeLabel(value: string): string {
  return FISHING_TYPES.find(f => f.value === value)?.label ?? value
}

export function getFishingTypeIcon(value: string): string {
  return FISHING_TYPES.find(f => f.value === value)?.icon ?? '🎣'
}

export function getExperienceLabel(value: string): string {
  return EXPERIENCE_LEVELS.find(e => e.value === value)?.label ?? value
}
