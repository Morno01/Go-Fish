import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {Avatar, ErrorMessage} from '../../components/ui';
import {supabase} from '../../lib/supabase';
import {Trip, TripParticipant} from '../../types';
import {formatDate} from '../../lib/utils';

interface Props {
  route: {params: {tripId: string}};
  navigation: any;
}

export default function TripDetailScreen({route, navigation}: Props) {
  const {tripId} = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [participation, setParticipation] = useState<TripParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const [{data: tripData}, {data: participantsData}] = await Promise.all([
        supabase
          .from('trips')
          .select('*, profiles(*)')
          .eq('id', tripId)
          .single(),
        supabase
          .from('trip_participants')
          .select('*, profiles(*)')
          .eq('trip_id', tripId),
      ]);

      if (tripData) setTrip(tripData);
      if (participantsData) {
        setParticipants(participantsData);
        if (user) {
          const myParticipation = participantsData.find(
            (p: TripParticipant) => p.user_id === user.id,
          );
          setParticipation(myParticipation ?? null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = async () => {
    if (!trip || !currentUserId) return;
    setActionLoading(true);
    setError('');
    const {error: joinError} = await supabase.from('trip_participants').insert({
      trip_id: trip.id,
      user_id: currentUserId,
      status: 'pending',
    });
    if (joinError) {
      setError(joinError.message);
    } else {
      await loadData();
    }
    setActionLoading(false);
  };

  const handleLeave = () => {
    Alert.alert('Forlad tur', 'Er du sikker på, at du vil forlade denne tur?', [
      {text: 'Annuller', style: 'cancel'},
      {
        text: 'Forlad',
        style: 'destructive',
        onPress: async () => {
          if (!participation) return;
          setActionLoading(true);
          await supabase
            .from('trip_participants')
            .delete()
            .eq('id', participation.id);
          await loadData();
          setActionLoading(false);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <PageHeader title="Tur detaljer" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <PageHeader title="Tur detaljer" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.notFound}>Turen blev ikke fundet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = trip.creator_id === currentUserId;
  const isParticipant = !!participation;
  const isFull = trip.current_participants >= trip.max_participants;
  const isGratis = !trip.price_per_person || trip.price_per_person === 0;
  const acceptedParticipants = participants.filter(p => p.status === 'accepted');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title={trip.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ErrorMessage message={error} />

        {/* Badges row */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.typeBadge,
              trip.trip_type === 'samkørsel' ? styles.typeBadgeBlue : styles.typeBadgeTeal,
            ]}>
            <Text style={styles.typeBadgeText}>
              {trip.trip_type === 'samkørsel' ? '🚗 Samkørsel' : '📍 Meetup'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              trip.status === 'active' ? styles.statusActive : styles.statusOther,
            ]}>
            <Text style={styles.statusText}>
              {trip.status === 'active'
                ? 'Aktiv'
                : trip.status === 'full'
                ? 'Fuld'
                : trip.status === 'cancelled'
                ? 'Aflyst'
                : 'Afsluttet'}
            </Text>
          </View>
        </View>

        {/* Main info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{trip.destination}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoLabel}>Dato</Text>
              <Text style={styles.infoValue}>{formatDate(trip.date)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🎣</Text>
            <View>
              <Text style={styles.infoLabel}>Fisketype</Text>
              <Text style={styles.infoValue}>{trip.fishing_type}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <View>
              <Text style={styles.infoLabel}>Deltagere</Text>
              <Text style={styles.infoValue}>
                {trip.current_participants} / {trip.max_participants}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View>
              <Text style={styles.infoLabel}>Pris</Text>
              <Text style={styles.infoValue}>
                {isGratis ? 'Gratis' : `${trip.price_per_person} kr/person`}
              </Text>
            </View>
          </View>
        </View>

        {/* Creator */}
        {trip.profiles && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arrangør</Text>
            <View style={styles.creatorRow}>
              <Avatar name={trip.profiles.full_name || trip.profiles.username} size={44} />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{trip.profiles.full_name}</Text>
                <Text style={styles.creatorUsername}>@{trip.profiles.username}</Text>
              </View>
              {isCreator && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>Dig</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Target species */}
        {trip.target_species && trip.target_species.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Målarter</Text>
            <View style={styles.chipsRow}>
              {trip.target_species.map(sp => (
                <View key={sp} style={styles.speciesChip}>
                  <Text style={styles.speciesChipText}>{sp}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Description */}
        {trip.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beskrivelse</Text>
            <Text style={styles.description}>{trip.description}</Text>
          </View>
        ) : null}

        {/* Participants */}
        {acceptedParticipants.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Deltagere ({acceptedParticipants.length})
            </Text>
            {acceptedParticipants.map(p => (
              <View key={p.id} style={styles.participantRow}>
                <Avatar
                  name={
                    p.profiles?.full_name || p.profiles?.username || 'Deltager'
                  }
                  size={36}
                />
                <Text style={styles.participantName}>
                  {p.profiles?.full_name ?? p.profiles?.username ?? 'Deltager'}
                </Text>
                {p.user_id === currentUserId && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>Dig</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : null}

        {/* Action button */}
        {!isCreator && trip.status === 'active' && (
          <View style={styles.actionArea}>
            {isParticipant ? (
              <TouchableOpacity
                style={styles.leaveBtn}
                onPress={handleLeave}
                disabled={actionLoading}
                activeOpacity={0.8}>
                {actionLoading ? (
                  <ActivityIndicator color="#dc2626" />
                ) : (
                  <Text style={styles.leaveBtnText}>Forlad tur</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.joinBtn, isFull && styles.joinBtnDisabled]}
                onPress={handleJoin}
                disabled={actionLoading || isFull}
                activeOpacity={0.8}>
                {actionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.joinBtnText}>
                    {isFull ? 'Turen er fuld' : 'Tilmeld tur'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    color: '#6b7280',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeBlue: {backgroundColor: '#dbeafe'},
  typeBadgeTeal: {backgroundColor: '#ccfbf1'},
  typeBadgeText: {fontSize: 13, fontWeight: '600', color: '#1e3a5f'},
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusActive: {backgroundColor: '#dcfce7'},
  statusOther: {backgroundColor: '#f3f4f6'},
  statusText: {fontSize: 13, fontWeight: '600', color: '#166534'},
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  infoIcon: {fontSize: 20},
  infoLabel: {fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'},
  infoValue: {fontSize: 15, color: '#111827', fontWeight: '600', marginTop: 2},
  divider: {height: 1, backgroundColor: '#f3f4f6'},
  section: {marginBottom: 16},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  creatorInfo: {flex: 1},
  creatorName: {fontSize: 15, fontWeight: '700', color: '#111827'},
  creatorUsername: {fontSize: 13, color: '#6b7280'},
  youBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  youBadgeText: {fontSize: 12, color: '#1d4ed8', fontWeight: '600'},
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  speciesChip: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  speciesChipText: {fontSize: 13, color: '#0d9488', fontWeight: '500'},
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantName: {flex: 1, fontSize: 15, color: '#111827', fontWeight: '500'},
  actionArea: {marginTop: 8, marginBottom: 24},
  joinBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinBtnDisabled: {backgroundColor: '#9ca3af'},
  joinBtnText: {color: '#ffffff', fontSize: 16, fontWeight: '700'},
  leaveBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  leaveBtnText: {color: '#dc2626', fontSize: 16, fontWeight: '700'},
});
