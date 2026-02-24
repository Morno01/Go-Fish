# 🎣 Go-Fish

En dansk fiske-app der matcher lystfiskere – ligesom GoMore, men til fiskeri.

## Stack

- **Next.js 16** (App Router) + JavaScript
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL + Realtime)
- **PWA** (Progressive Web App – fungerer som app på mobil)

## Features

| Feature | Status |
|---|---|
| Brugeroprettelse & login (Supabase Auth) | ✅ |
| Fiskerprofil med præferencer (vandtype, arter, regioner) | ✅ |
| Fisketure – Samkørsel (delt køretur) | ✅ |
| Fisketure – Mødested (mød op selv) | ✅ |
| Opret og tilmeld fisketure | ✅ |
| Match/Swipe (Tinder-stil) | ✅ |
| Realtime chat | ✅ |
| Fiskejournal (vejr, grej, GPS, tidevand, månefase) | ✅ |
| Dashboard med kortpladsholder | ✅ |
| PWA manifest (installérbar som app) | ✅ |
| Interaktivt kort (Leaflet/Mapbox) | 🔜 |
| Vejr-API integration | 🔜 |

## Kom i gang

### 1. Klon og installer

```bash
git clone <repo>
cd go-fish
npm install
```

### 2. Opret Supabase projekt

1. Gå til [supabase.com](https://supabase.com) og opret et projekt
2. Kør SQL-skemaet fra `lib/supabase/schema.sql` i Supabase SQL Editor
3. Kopiér Project URL og anon key

### 3. Miljøvariabler

```bash
cp .env.local.example .env.local
```

Udfyld `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Start udviklingsserver

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000)

## Mapstruktur

```
app/
├── page.js              # Forside med søgefelt
├── login/               # Login
├── register/            # Registrering (3-trins)
├── dashboard/           # Dashboard med kort
├── trips/               # Fisketure (samkørsel + mødested)
│   ├── create/          # Opret tur
│   └── [id]/            # Turdetaljer
├── match/               # Swipe/match fiskere
├── chat/                # Samtaler
│   └── [id]/            # Chat
├── journal/             # Fiskejournal
│   ├── create/          # Ny log
│   └── [id]/            # Log detaljer
└── profile/             # Profil
    ├── edit/            # Rediger profil
    └── [id]/            # Andres profiler

components/
├── BottomNav.js         # Bundnavigation
├── TripCard.js          # Turkort
├── PageHeader.js        # Side-header
└── AuthForm.js          # Form-komponenter

lib/
├── supabase/
│   ├── client.js        # Browser Supabase client
│   ├── server.js        # Server Supabase client
│   └── schema.sql       # Database skema
└── utils.js             # Konstanter og hjælpefunktioner
```

## Database skema

- `profiles` – Brugerprofiler (udvidelse af auth.users)
- `trips` – Fisketure (samkørsel og mødested)
- `trip_participants` – Turdeltagere
- `matches` – Swipe/match data
- `conversations` – Samtaler
- `messages` – Beskeder (realtime)
- `journal_entries` – Fiskejournal

## PWA

Appen er konfigureret som PWA med `manifest.json`. På mobil kan brugere installere den fra browser-menuen ("Tilføj til startskærm").

For fuldt PWA support med offline cache, tilføj en service worker (f.eks. via `next-pwa` pakken som allerede er installeret).

## Næste skridt

1. **Tilføj ikon-filer** til `public/icons/` (icon-192.png, icon-512.png)
2. **Konfigurer Supabase** med din URL og nøgle
3. **Kør SQL-skemaet** i Supabase
4. **Deploy** på Vercel (gratis tier)
5. **Tilføj kort** med Leaflet eller Google Maps
6. **Vejr-API** (met.no eller OpenWeatherMap)

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Tilføj miljøvariabler i Vercel dashboard.
