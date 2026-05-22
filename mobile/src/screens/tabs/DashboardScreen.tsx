import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {supabase} from '../../lib/supabase';
import {Trip, Profile} from '../../types';
import TripCard from '../../components/TripCard';

interface Props {
  navigation: any;
}

export default function DashboardScreen({navigation}: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState({trips: 0, matches: 0, catches: 0});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const {data: profileData} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Load upcoming trips (user is participant or creator)
      const today = new Date().toISOString();
      const {data: participations} = await supabase
        .from('trip_participants')
        .select('trip_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const participatedTripIds = (participations ?? []).map((p: any) => p.trip_id);

      const {data: tripsData} = await supabase
        .from('trips')
        .select('*, profiles(*)')
        .or(`creator_id.eq.${user.id}${participatedTripIds.length > 0 ? `,id.in.(${participatedTripIds.join(',')})` : ''}`)
        .gte('date', today)
        .eq('status', 'active')
        .order('date', {ascending: true})
        .limit(5);
      if (tripsData) setUpcomingTrips(tripsData);

      // Stats
      const [{count: tripCount}, {count: matchCount}, {count: catchCount}] =
        await Promise.all([
          supabase
            .from('trips')
            .select('*', {count: 'exact', head: true})
            .eq('creator_id', user.id),
          supabase
            .from('matches')
            .select('*', {count: 'exact', head: true})
            .eq('user_id', user.id)
            .eq('action', 'like'),
          supabase
            .from('journal_entries')
            .select('*', {count: 'exact', head: true})
            .eq('user_id', user.id),
        ]);

      setStats({
        trips: tripCount ?? 0,
        matches: matchCount ?? 0,
        catches: catchCount ?? 0,
      });
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Fisker';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1d4ed8"
          />
        }>
        {/* Hero gradient header */}
        <LinearGradient
          colors={['#1d4ed8', '#0d9488']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <Text style={styles.greeting}>Hej {firstName}! 👋</Text>
          <Text style={styles.subgreeting}>Klar til at fiske?</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.trips}</Text>
              <Text style={styles.statLabel}>Mine ture</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.catches}</Text>
              <Text style={styles.statLabel}>Fangster</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hurtige handlinger</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => navigation.navigate('Trips', {screen: 'TripCreate'})}
                activeOpacity={0.8}>
                <Text style={styles.quickBtnIcon}>➕</Text>
                <Text style={styles.quickBtnText}>Opret tur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, styles.quickBtnTeal]}
                onPress={() => navigation.navigate('Match')}
                activeOpacity={0.8}>
                <Text style={styles.quickBtnIcon}>❤️</Text>
                <Text style={styles.quickBtnText}>Find makker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, styles.quickBtnGreen]}
                onPress={() => navigation.navigate('Journal', {screen: 'JournalCreate'})}
                activeOpacity={0.8}>
                <Text style={styles.quickBtnIcon}>📖</Text>
                <Text style={styles.quickBtnText}>Ny fangst</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Map placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kort</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapTitle}>Interaktivt kort</Text>
              <Text style={styles.mapSubtitle}>Kommer snart – se ture nær dig</Text>
            </View>
          </View>

          {/* Upcoming trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kommende ture</Text>
            {loading ? (
              <ActivityIndicator color="#1d4ed8" size="large" />
            ) : upcomingTrips.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🎣</Text>
                <Text style={styles.emptyText}>Ingen kommende ture.</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Trips', {screen: 'TripCreate'})}>
                  <Text style={styles.emptyLink}>Opret din første tur!</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={() =>
                    navigation.navigate('Trips', {
                      screen: 'TripDetail',
                      params: {tripId: trip.id},
                    })
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  subgreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  body: {
    padding: 16,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickBtnTeal: {
    backgroundColor: '#0d9488',
  },
  quickBtnGreen: {
    backgroundColor: '#059669',
  },
  quickBtnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  quickBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapPlaceholder: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  mapSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 6,
  },
  emptyLink: {
    fontSize: 15,
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
