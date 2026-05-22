import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {supabase} from '../../lib/supabase';
import {Profile} from '../../types';
import SwipeCard from '../../components/SwipeCard';
import {Avatar} from '../../components/ui';

interface Props {
  navigation: any;
}

type Tab = 'find' | 'matches';

export default function MatchScreen({navigation}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('find');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mutualMatches, setMutualMatches] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const currentUserId = useRef<string>('');

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;
      currentUserId.current = user.id;

      // Get already-swiped user IDs
      const {data: swipedData} = await supabase
        .from('matches')
        .select('target_id')
        .eq('user_id', user.id);
      const swipedIds = (swipedData ?? []).map((s: any) => s.target_id);
      swipedIds.push(user.id);

      const {data} = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${swipedIds.join(',')})`)
        .limit(20);

      setProfiles(data ?? []);
      setCurrentIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMutualMatches = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;

      // Find users who liked me
      const {data: theyLikedMe} = await supabase
        .from('matches')
        .select('user_id')
        .eq('target_id', user.id)
        .eq('action', 'like');
      const theyIds = (theyLikedMe ?? []).map((m: any) => m.user_id);

      if (theyIds.length === 0) {
        setMutualMatches([]);
        return;
      }

      // Find users I liked
      const {data: iLikedThem} = await supabase
        .from('matches')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('action', 'like')
        .in('target_id', theyIds);
      const mutualIds = (iLikedThem ?? []).map((m: any) => m.target_id);

      if (mutualIds.length === 0) {
        setMutualMatches([]);
        return;
      }

      const {data: matchedProfiles} = await supabase
        .from('profiles')
        .select('*')
        .in('id', mutualIds);
      setMutualMatches(matchedProfiles ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
    loadMutualMatches();
  }, [loadProfiles, loadMutualMatches]);

  const handleSwipe = async (action: 'like' | 'pass') => {
    const userId = currentUserId.current;
    const profile = profiles[currentIndex];
    if (!profile || !userId) return;

    await supabase.from('matches').upsert({
      user_id: userId,
      target_id: profile.id,
      action,
    });

    if (action === 'like') {
      // Check mutual
      const {data} = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', profile.id)
        .eq('target_id', userId)
        .eq('action', 'like')
        .single();
      if (data) {
        setMatchedProfile(profile);
        setMatchModal(true);
        loadMutualMatches();
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleOpenChat = async () => {
    setMatchModal(false);
    if (!matchedProfile) return;
    const userId = currentUserId.current;

    // Find or create conversation
    const {data: existing} = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1.eq.${userId},participant_2.eq.${matchedProfile.id}),and(participant_1.eq.${matchedProfile.id},participant_2.eq.${userId})`,
      )
      .single();

    let convId = existing?.id;
    if (!convId) {
      const {data: newConv} = await supabase
        .from('conversations')
        .insert({participant_1: userId, participant_2: matchedProfile.id})
        .select()
        .single();
      convId = newConv?.id;
    }

    navigation.navigate('Chat', {
      screen: 'ChatConversation',
      params: {conversationId: convId, otherUserName: matchedProfile.full_name},
    });
  };

  const currentProfile = profiles[currentIndex];
  const hasMore = currentIndex < profiles.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Tab toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'find' && styles.tabBtnActive]}
          onPress={() => setActiveTab('find')}>
          <Text style={[styles.tabText, activeTab === 'find' && styles.tabTextActive]}>
            🔍 Find
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'matches' && styles.tabBtnActive]}
          onPress={() => setActiveTab('matches')}>
          <Text
            style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
            ❤️ Matches ({mutualMatches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Find tab */}
      {activeTab === 'find' && (
        <View style={styles.findContainer}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#1d4ed8" size="large" />
              <Text style={styles.loadingText}>Finder fiskere...</Text>
            </View>
          ) : !hasMore || !currentProfile ? (
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🎣</Text>
              <Text style={styles.emptyTitle}>Ingen flere fiskere at vise</Text>
              <Text style={styles.emptySubtitle}>
                Kom tilbage senere for at finde nye makkere!
              </Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={loadProfiles}>
                <Text style={styles.refreshBtnText}>Genindlæs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.cardArea}>
                <SwipeCard
                  key={currentProfile.id}
                  profile={currentProfile}
                  onSwipeLeft={() => handleSwipe('pass')}
                  onSwipeRight={() => handleSwipe('like')}
                />
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.passBtn}
                  onPress={() => handleSwipe('pass')}
                  activeOpacity={0.8}>
                  <Text style={styles.passBtnText}>✗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => handleSwipe('like')}
                  activeOpacity={0.8}>
                  <Text style={styles.likeBtnText}>✓</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardCounter}>
                {currentIndex + 1} / {profiles.length}
              </Text>
            </>
          )}
        </View>
      )}

      {/* Matches tab */}
      {activeTab === 'matches' && (
        <FlatList
          data={mutualMatches}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.matchList}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>💔</Text>
              <Text style={styles.emptyTitle}>Ingen matches endnu</Text>
              <Text style={styles.emptySubtitle}>
                Svirp til højre for at like fiskere og find et match!
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.matchRow}
              onPress={async () => {
                const userId = currentUserId.current;
                const {data: existing} = await supabase
                  .from('conversations')
                  .select('*')
                  .or(
                    `and(participant_1.eq.${userId},participant_2.eq.${item.id}),and(participant_1.eq.${item.id},participant_2.eq.${userId})`,
                  )
                  .single();

                let convId = existing?.id;
                if (!convId) {
                  const {data: newConv} = await supabase
                    .from('conversations')
                    .insert({participant_1: userId, participant_2: item.id})
                    .select()
                    .single();
                  convId = newConv?.id;
                }
                navigation.navigate('Chat', {
                  screen: 'ChatConversation',
                  params: {conversationId: convId, otherUserName: item.full_name},
                });
              }}
              activeOpacity={0.8}>
              <Avatar name={item.full_name || item.username} size={50} />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{item.full_name}</Text>
                <Text style={styles.matchUsername}>@{item.username}</Text>
                {item.fishing_types && item.fishing_types.length > 0 && (
                  <Text style={styles.matchTypes}>
                    🎣 {item.fishing_types.slice(0, 2).join(', ')}
                  </Text>
                )}
              </View>
              <Text style={styles.matchArrow}>💬</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Match modal */}
      <Modal visible={matchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎣</Text>
            <Text style={styles.modalTitle}>Det er et match!</Text>
            <Text style={styles.modalSubtitle}>
              Du og {matchedProfile?.full_name} kan godt lide hinanden.
            </Text>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleOpenChat}>
              <Text style={styles.modalPrimaryText}>Send besked 💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => setMatchModal(false)}>
              <Text style={styles.modalSecondaryText}>Fortsæt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  tabBtnActive: {
    backgroundColor: '#1d4ed8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  findContainer: {
    flex: 1,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 15,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardArea: {
    marginTop: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 12,
    marginTop: 16,
  },
  passBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  passBtnText: {
    fontSize: 28,
    color: '#dc2626',
    fontWeight: '700',
  },
  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  likeBtnText: {
    fontSize: 28,
    color: '#16a34a',
    fontWeight: '700',
  },
  cardCounter: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  matchList: {
    padding: 16,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  matchUsername: {
    fontSize: 13,
    color: '#6b7280',
  },
  matchTypes: {
    fontSize: 12,
    color: '#0d9488',
    marginTop: 2,
  },
  matchArrow: {
    fontSize: 22,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalPrimaryBtn: {
    width: '100%',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
  },
  modalSecondaryText: {
    color: '#6b7280',
    fontSize: 15,
  },
});
