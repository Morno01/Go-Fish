# Go-Fish Mobile App

React Native CLI app (bare workflow) – App Store & Google Play

## Requirements

- Node.js 18+
- Ruby (for iOS CocoaPods)
- Xcode 15+ (iOS)
- Android Studio + JDK 17 (Android)
- React Native CLI: `npm install -g react-native-cli`

## Setup

1. Initialize a new React Native project (generates iOS/Android native folders):
   ```bash
   npx react-native@0.74.1 init GoFish --template react-native-template-typescript
   ```

2. Replace generated files with this project's files:
   ```bash
   cp -r src/ GoFish/src/
   cp index.js App.tsx package.json babel.config.js tsconfig.json metro.config.js GoFish/
   ```

3. Install dependencies:
   ```bash
   cd GoFish
   npm install
   ```

4. iOS setup:
   ```bash
   cd ios && pod install && cd ..
   ```

5. Add environment variables – create a `.env` file:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
   Install react-native-dotenv and add to babel config, or use react-native-config.

6. Run:
   ```bash
   npx react-native run-ios      # iOS Simulator
   npx react-native run-android  # Android Emulator
   ```

## Build for App Store (iOS)

1. Open `ios/GoFish.xcworkspace` in Xcode
2. Set Bundle Identifier: `dk.gofish.app`
3. Select "Any iOS Device" as target
4. Product → Archive
5. Upload via Xcode Organizer or Transporter

## Build for Google Play (Android)

1. Generate signing key:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add to `android/gradle.properties`:
   ```
   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=my-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=*****
   MYAPP_RELEASE_KEY_PASSWORD=*****
   ```

3. Build release APK/AAB:
   ```bash
   cd android && ./gradlew bundleRelease
   ```

4. Upload `android/app/build/outputs/bundle/release/app-release.aab` to Google Play Console

## App Store Info

- **iOS Bundle ID**: `dk.gofish.app`
- **Android Package**: `dk.gofish.app`
- **Category**: Sports / Outdoor
- **Age Rating**: 4+

## Architecture

```
src/
├── navigation/index.tsx     – Root navigator (auth + tab stacks)
├── lib/
│   ├── supabase.ts          – Supabase client with AsyncStorage session
│   └── utils.ts             – Constants, formatDate, timeAgo, getInitials
├── types/index.ts           – TypeScript interfaces
├── components/
│   ├── ui.tsx               – Button, Input, Chip, Avatar, SwitchRow, ErrorMessage
│   ├── PageHeader.tsx       – Blue header with back button
│   ├── TripCard.tsx         – Trip list card
│   └── SwipeCard.tsx        – Swipeable profile card (gesture + animation)
└── screens/
    ├── auth/                – Landing, Login, Register (3-step)
    ├── tabs/                – Dashboard, Trips, Match, Chat, Journal, Profile
    └── detail/              – TripDetail, TripCreate, ChatConversation,
                               JournalDetail, JournalCreate, ProfileEdit
```

## Supabase Tables Required

```sql
-- profiles (auto-created by auth trigger)
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  email text,
  bio text,
  location text,
  experience_level text,
  fishing_types text[],
  target_species text[],
  regions text[],
  has_car boolean default false,
  has_boat boolean default false,
  avatar_url text,
  created_at timestamptz default now()
);

-- trips
create table trips (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references profiles(id),
  title text not null,
  description text,
  trip_type text not null, -- 'samkørsel' | 'meetup'
  fishing_type text not null,
  target_species text[],
  destination text not null,
  latitude float,
  longitude float,
  date timestamptz not null,
  max_participants int not null default 4,
  current_participants int not null default 0,
  price_per_person float default 0,
  status text default 'active', -- 'active' | 'full' | 'cancelled' | 'completed'
  created_at timestamptz default now()
);

-- trip_participants
create table trip_participants (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- matches
create table matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  target_id uuid references profiles(id),
  action text not null, -- 'like' | 'pass'
  created_at timestamptz default now(),
  unique(user_id, target_id)
);

-- conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  participant_1 uuid references profiles(id),
  participant_2 uuid references profiles(id),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- journal_entries
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  location text not null,
  date timestamptz not null,
  fishing_type text not null,
  fish_caught jsonb,
  weather text,
  wind_speed float,
  wind_direction text,
  temperature float,
  water_temperature float,
  moon_phase text,
  tide text,
  pressure text,
  gear_used jsonb,
  notes text,
  photos text[],
  is_public boolean default false,
  tags text[],
  created_at timestamptz default now()
);
```

Enable Realtime on `messages` table in Supabase dashboard for live chat.
