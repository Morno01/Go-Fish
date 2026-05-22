import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {supabase} from '../../lib/supabase';
import {JournalEntry} from '../../types';
import {formatDate} from '../../lib/utils';

interface Props {
  route: {params: {entryId: string}};
  navigation: any;
}

export default function JournalDetailScreen({route, navigation}: Props) {
  const {entryId} = route.params;
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEntry = useCallback(async () => {
    const {data} = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();
    if (data) setEntry(data);
    setLoading(false);
  }, [entryId]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <PageHeader title="Fangst" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <PageHeader title="Fangst" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.notFound}>Fangsten blev ikke fundet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalFish = (entry.fish_caught ?? []).reduce(
    (sum, f) => sum + (f.count ?? 0),
    0,
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title={entry.location} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Date + type */}
        <View style={styles.topRow}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          <View style={styles.fishingBadge}>
            <Text style={styles.fishingBadgeText}>🎣 {entry.fishing_type}</Text>
          </View>
          {entry.is_public ? (
            <View style={styles.publicBadge}>
              <Text style={styles.publicBadgeText}>Offentlig</Text>
            </View>
          ) : null}
        </View>

        {/* Weather info row */}
        {(entry.weather || entry.temperature != null || entry.wind_speed != null) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vejr & Forhold</Text>
            <View style={styles.weatherGrid}>
              {entry.weather ? (
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>🌤</Text>
                  <Text style={styles.weatherLabel}>Vejr</Text>
                  <Text style={styles.weatherValue}>{entry.weather}</Text>
                </View>
              ) : null}
              {entry.temperature != null ? (
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>🌡️</Text>
                  <Text style={styles.weatherLabel}>Lufttemp</Text>
                  <Text style={styles.weatherValue}>{entry.temperature}°C</Text>
                </View>
              ) : null}
              {entry.water_temperature != null ? (
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>💧</Text>
                  <Text style={styles.weatherLabel}>Vandtemp</Text>
                  <Text style={styles.weatherValue}>{entry.water_temperature}°C</Text>
                </View>
              ) : null}
              {entry.wind_speed != null ? (
                <View style={styles.weatherItem}>
                  <Text style={styles.weatherIcon}>💨</Text>
                  <Text style={styles.weatherLabel}>Vind</Text>
                  <Text style={styles.weatherValue}>
                    {entry.wind_speed} m/s{entry.wind_direction ? ` ${entry.wind_direction}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Moon / Tide / Pressure chips */}
        {(entry.moon_phase || entry.tide || entry.pressure) ? (
          <View style={styles.chipsRow}>
            {entry.moon_phase ? (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>🌙 {entry.moon_phase}</Text>
              </View>
            ) : null}
            {entry.tide ? (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>🌊 {entry.tide}</Text>
              </View>
            ) : null}
            {entry.pressure ? (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>🔵 {entry.pressure}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Fish caught */}
        {entry.fish_caught && entry.fish_caught.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fangst ({totalFish} fisk)</Text>
            {entry.fish_caught.map((f, idx) => (
              <View key={idx} style={styles.fishRow}>
                <Text style={styles.fishEmoji}>🐟</Text>
                <Text style={styles.fishSpecies}>{f.species}</Text>
                <Text style={styles.fishCount}>{f.count} stk</Text>
                {f.weight != null ? (
                  <Text style={styles.fishWeight}>{f.weight} kg</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fangst</Text>
            <Text style={styles.noFishText}>Ingen fangst registreret 😔</Text>
          </View>
        )}

        {/* Gear used */}
        {entry.gear_used && entry.gear_used.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Udstyr brugt</Text>
            {entry.gear_used.map((g, idx) => (
              <View key={idx} style={styles.gearRow}>
                <Text style={styles.gearType}>🎯 {g.type}</Text>
                <Text style={styles.gearDetails}>{g.details}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Notes */}
        {entry.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Noter</Text>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        ) : null}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 ? (
          <View style={styles.chipsRow}>
            {entry.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f8fafc'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  notFound: {color: '#6b7280', fontSize: 16},
  content: {padding: 16},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  date: {fontSize: 15, color: '#6b7280', flex: 1},
  fishingBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fishingBadgeText: {fontSize: 13, color: '#1d4ed8', fontWeight: '600'},
  publicBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  publicBadgeText: {fontSize: 13, color: '#16a34a', fontWeight: '600'},
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  weatherItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  weatherIcon: {fontSize: 22, marginBottom: 2},
  weatherLabel: {fontSize: 11, color: '#9ca3af', fontWeight: '600'},
  weatherValue: {fontSize: 13, color: '#111827', fontWeight: '600', marginTop: 2},
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  infoChip: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  infoChipText: {fontSize: 13, color: '#0369a1', fontWeight: '500'},
  fishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  fishEmoji: {fontSize: 18},
  fishSpecies: {flex: 1, fontSize: 15, color: '#111827', fontWeight: '600'},
  fishCount: {fontSize: 14, color: '#059669', fontWeight: '600'},
  fishWeight: {fontSize: 13, color: '#6b7280', marginLeft: 8},
  noFishText: {fontSize: 15, color: '#6b7280'},
  gearRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  gearType: {fontSize: 14, fontWeight: '700', color: '#374151'},
  gearDetails: {fontSize: 14, color: '#6b7280', marginTop: 2},
  notesText: {fontSize: 15, color: '#374151', lineHeight: 22},
  tagChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagChipText: {fontSize: 13, color: '#6b7280', fontWeight: '500'},
});
