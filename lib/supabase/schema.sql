-- ============================================================
-- Go-Fish Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  fishing_types TEXT[] DEFAULT '{}',  -- 'hav','sø','å','put_and_take','mole','båd'
  fish_species TEXT[] DEFAULT '{}',   -- target fish
  regions TEXT[] DEFAULT '{}',        -- fishing regions in Denmark
  experience_level TEXT DEFAULT 'beginner', -- beginner, intermediate, expert
  has_boat BOOLEAN DEFAULT FALSE,
  has_car BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trips
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('samkørsel', 'meetup')),
  fishing_type TEXT NOT NULL,          -- hav, sø, å, etc.
  fish_species TEXT[] DEFAULT '{}',
  destination TEXT NOT NULL,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  departure_location TEXT,
  departure_lat DOUBLE PRECISION,
  departure_lng DOUBLE PRECISION,
  trip_date DATE NOT NULL,
  trip_time TIME,
  max_participants INT DEFAULT 4,
  current_participants INT DEFAULT 1,
  price_per_person NUMERIC(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trips are viewable by everyone" ON trips FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create trips" ON trips FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Trip creators can update trips" ON trips FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Trip creators can delete trips" ON trips FOR DELETE USING (auth.uid() = creator_id);

-- Trip participants
CREATE TABLE trip_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable by trip members" ON trip_participants FOR SELECT USING (TRUE);
CREATE POLICY "Users can join trips" ON trip_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON trip_participants FOR UPDATE USING (auth.uid() = user_id);

-- Matches (swipe/tinder)
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_id);
CREATE POLICY "Users can insert own matches" ON matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Fishing Journal
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  fishing_date DATE NOT NULL,
  fishing_type TEXT,
  fish_caught TEXT[] DEFAULT '{}',  -- [{species, weight, length, photo}]
  weather TEXT,
  wind_speed TEXT,
  wind_direction TEXT,
  temperature NUMERIC(5,2),
  water_temp NUMERIC(5,2),
  moon_phase TEXT,
  tide TEXT,               -- høj vand / lav vand
  pressure TEXT,           -- højtryk / lavtryk
  gear_used JSONB DEFAULT '[]',   -- [{type, size, brand}]
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public journals viewable by everyone" ON journal_entries
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users can create own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
