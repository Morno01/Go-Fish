import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {supabase} from '../../lib/supabase';
import {Trip} from '../../types';
import TripCard from '../../components/TripCard';
import {FISHING_TYPES} from '../../lib/utils';

interface Props {
  navigation: any;
}

type TripTypeFilter = 'alle' | 'samkørsel' | 'meetup';

export default function TripsScreen({navigation}: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TripTypeFilter>('alle');
  const [fishingFilter, setFishingFilter] = useState<string>('');

  const loadTrips = useCallback(async () => {
    try {
      let query = supabase
        .from('trips')
        .select('*, profiles(*)')
        .eq('status', 'active')
        .order('date', {ascending: true});

      if (typeFilter !== 'alle') {
        query = query.eq('trip_type', typeFilter);
      }
      if (fishingFilter) {
        query = query.eq('fishing_type', fishingFilter);
      }

      const {data, error} = await query;
      if (!error && data) setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, fishingFilter]);

  useEffect(() => {
    setLoading(true);
    loadTrips();
  }, [loadTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const typeFilters: {label: string; value: TripTypeFilter}[] = [
    {label: 'Alle', value: 'alle'},
    {label: '🚗 Samkørsel', value: 'samkørsel'},
    {label: '📍 Meetup', value: 'meetup'},
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fisketure</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TripCreate')}
          activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Type filter row */}
      <View style={styles.typeFilterRow}>
        {typeFilters.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.typeFilterBtn,
              typeFilter === f.value && styles.typeFilterBtnActive,
            ]}
            onPress={() => setTypeFilter(f.value)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.typeFilterText,
                typeFilter === f.value && styles.typeFilterTextActive,
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fishing type horizontal scroll chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.fishingChipsContainer}
        style={styles.fishingChipsScroll}>
        <TouchableOpacity
          style={[styles.fishingChip, !fishingFilter && styles.fishingChipActive]}
          onPress={() => setFishingFilter('')}>
          <Text style={[styles.fishingChipText, !fishingFilter && styles.fishingChipTextActive]}>
            Alle typer
          </Text>
        </TouchableOpacity>
        {FISHING_TYPES.map(ft => (
          <TouchableOpacity
            key={ft.value}
            style={[
              styles.fishingChip,
              fishingFilter === ft.value && styles.fishingChipActive,
            ]}
            onPress={() =>
              setFishingFilter(fishingFilter === ft.value ? '' : ft.value)
            }>
            <Text
              style={[
                styles.fishingChipText,
                fishingFilter === ft.value && styles.fishingChipTextActive,
              ]}>
              {ft.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1d4ed8" size="large" />
          <Text style={styles.loadingText}>Henter ture...</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TripCard
              trip={item}
              onPress={() => navigation.navigate('TripDetail', {tripId: item.id})}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1d4ed8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎣</Text>
              <Text style={styles.emptyTitle}>Ingen ture fundet</Text>
              <Text style={styles.emptySubtitle}>
                Prøv at ændre filtrene eller opret en ny tur.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('TripCreate')}>
                <Text style={styles.emptyBtnText}>Opret tur</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '600',
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  typeFilterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  typeFilterBtnActive: {
    backgroundColor: '#1d4ed8',
  },
  typeFilterText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  typeFilterTextActive: {
    color: '#ffffff',
  },
  fishingChipsScroll: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fishingChipsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  fishingChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
  },
  fishingChipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#1d4ed8',
  },
  fishingChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  fishingChipTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
