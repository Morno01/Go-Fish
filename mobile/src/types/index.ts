export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  bio?: string;
  location?: string;
  experience_level?: 'beginner' | 'intermediate' | 'expert';
  fishing_types?: string[];
  target_species?: string[];
  regions?: string[];
  has_car?: boolean;
  has_boat?: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  trip_type: 'samkørsel' | 'meetup';
  fishing_type: string;
  target_species?: string[];
  destination: string;
  latitude?: number;
  longitude?: number;
  date: string;
  max_participants: number;
  current_participants: number;
  price_per_person?: number;
  status: 'active' | 'full' | 'cancelled' | 'completed';
  created_at: string;
  profiles?: Profile;
}

export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  profiles?: Profile;
}

export interface Match {
  id: string;
  user_id: string;
  target_id: string;
  action: 'like' | 'pass';
  created_at: string;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  other_user?: Profile;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  location: string;
  date: string;
  fishing_type: string;
  fish_caught?: Array<{species: string; count: number; weight?: number}>;
  weather?: string;
  wind_speed?: number;
  wind_direction?: string;
  temperature?: number;
  water_temperature?: number;
  moon_phase?: string;
  tide?: string;
  pressure?: string;
  gear_used?: Array<{type: string; details: string}>;
  notes?: string;
  photos?: string[];
  is_public: boolean;
  tags?: string[];
  created_at: string;
}
