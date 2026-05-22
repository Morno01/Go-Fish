export const FISHING_TYPES = [
  {value: 'hav', label: 'Hav'},
  {value: 'sø', label: 'Sø'},
  {value: 'å', label: 'Å/Flod'},
  {value: 'put_and_take', label: 'Put & Take'},
  {value: 'mole', label: 'Mole/Havn'},
  {value: 'båd', label: 'Bådfiskeri'},
];

export const FISH_SPECIES = [
  'Ørred',
  'Laks',
  'Gedde',
  'Aborre',
  'Sandart',
  'Torsk',
  'Havørred',
  'Regnbueørred',
  'Brasen',
  'Skalle',
  'Hornfisk',
  'Makrel',
  'Rødspætte',
  'Ål',
  'Karpe',
  'Zander',
  'Pighaj',
];

export const REGIONS = [
  'Nordjylland',
  'Midtjylland',
  'Syddanmark',
  'Sjælland',
  'Hovedstaden',
  'Bornholm',
];

export const EXPERIENCE_LEVELS = [
  {value: 'beginner', label: 'Begynder'},
  {value: 'intermediate', label: 'Øvet'},
  {value: 'expert', label: 'Ekspert'},
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Nu';
  if (diffMins < 60) return `${diffMins}m siden`;
  if (diffHours < 24) return `${diffHours}t siden`;
  if (diffDays < 7) return `${diffDays}d siden`;
  return formatDate(iso);
}
