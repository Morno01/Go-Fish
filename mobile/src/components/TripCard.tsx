import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Trip} from '../types';
import {formatDate} from '../lib/utils';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

export default function TripCard({trip, onPress}: TripCardProps) {
  const isFull = trip.current_participants >= trip.max_participants;
  const isGratis = !trip.price_per_person || trip.price_per_person === 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header row: badge + price */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.badge,
            trip.trip_type === 'samkørsel' ? styles.badgeBlue : styles.badgeTeal,
          ]}>
          <Text style={styles.badgeText}>
            {trip.trip_type === 'samkørsel' ? '🚗 Samkørsel' : '📍 Meetup'}
          </Text>
        </View>
        <Text style={styles.price}>
          {isGratis ? 'Gratis' : `${trip.price_per_person} kr`}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {trip.title}
      </Text>

      {/* Destination + Date */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📍 {trip.destination}</Text>
        <Text style={styles.infoText}>📅 {formatDate(trip.date)}</Text>
      </View>

      {/* Fishing type chip */}
      <View style={styles.fishingChip}>
        <Text style={styles.fishingChipText}>🎣 {trip.fishing_type}</Text>
      </View>

      {/* Footer: participants + status */}
      <View style={styles.footer}>
        <View style={styles.participantsRow}>
          <Text style={styles.participantsText}>
            👥 {trip.current_participants}/{trip.max_participants} deltagere
          </Text>
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>Fuld</Text>
            </View>
          )}
        </View>
        {trip.profiles?.full_name ? (
          <Text style={styles.creatorText}>af {trip.profiles.full_name}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
  },
  badgeTeal: {
    backgroundColor: '#ccfbf1',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  fishingChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  fishingChipText: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    marginTop: 2,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  fullBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fullBadgeText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  creatorText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
