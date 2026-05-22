import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {supabase} from '../../lib/supabase';
import {JournalEntry} from '../../types';
import {formatDate} from '../../lib/utils';

interface Props {
  navigation: any;
}

export default function JournalScreen({navigation}: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;

      const {data} = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', {ascending: false});

      setEntries(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const totalFish = (entry: JournalEntry) =>
    (entry.fish_caught ?? []).reduce((sum, f) => sum + (f.count ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fangstjournal</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('JournalCreate')}
          activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
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
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyTitle}>Ingen fangster endnu</Text>
              <Text style={styles.emptySubtitle}>Tilføj din første fangst!</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('JournalCreate')}>
                <Text style={styles.emptyBtnText}>Tilføj fangst</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({item}) => {
            const fishCount = totalFish(item);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('JournalDetail', {entryId: item.id})}
                activeOpacity={0.85}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardLocation} numberOfLines={1}>
                    📍 {item.location}
                  </Text>
                  {item.is_public ? (
                    <View style={styles.publicBadge}>
                      <Text style={styles.publicBadgeText}>Offentlig</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardDate}>{formatDate(item.date)}</Text>

                <View style={styles.cardRow}>
                  <View style={styles.fishingTypeBadge}>
                    <Text style={styles.fishingTypeText}>🎣 {item.fishing_type}</Text>
                  </View>
                  {fishCount > 0 && (
                    <Text style={styles.fishCount}>🐟 {fishCount} fisk</Text>
                  )}
                  {item.weather ? (
                    <Text style={styles.weather}>🌤 {item.weather}</Text>
                  ) : null}
                </View>

                {item.fish_caught && item.fish_caught.length > 0 ? (
                  <Text style={styles.speciesPreview} numberOfLines={1}>
                    {item.fish_caught
                      .map(f => `${f.species} (${f.count})`)
                      .join(' · ')}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
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
    marginBottom: 20,
    textAlign: 'center',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  publicBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  publicBadgeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  fishingTypeBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fishingTypeText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  fishCount: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  weather: {
    fontSize: 13,
    color: '#6b7280',
  },
  speciesPreview: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
});
