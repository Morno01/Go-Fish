import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {Profile} from '../types';
import {getInitials} from '../lib/utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeCard({profile, onSwipeLeft, onSwipeRight}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
    })
    .onEnd(e => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
    );
    return {
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
        {rotate: `${rotate}deg`},
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD / 2], [0, 1], 'clamp'),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD / 2, 0], [1, 0], 'clamp'),
  }));

  const initials = getInitials(profile.full_name || profile.username || '?');

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* LIKE overlay */}
        <Animated.View style={[styles.overlay, styles.overlayLike, likeOpacity]}>
          <Text style={styles.overlayTextLike}>LIKE ✓</Text>
        </Animated.View>

        {/* NEJ overlay */}
        <Animated.View style={[styles.overlay, styles.overlayNope, nopeOpacity]}>
          <Text style={styles.overlayTextNope}>NEJ ✗</Text>
        </Animated.View>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Name */}
        <Text style={styles.name}>{profile.full_name || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>

        {/* Location */}
        {profile.location ? (
          <Text style={styles.location}>📍 {profile.location}</Text>
        ) : null}

        {/* Bio */}
        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        ) : null}

        {/* Experience */}
        {profile.experience_level ? (
          <View style={styles.expBadge}>
            <Text style={styles.expText}>
              {profile.experience_level === 'beginner'
                ? '🟢 Begynder'
                : profile.experience_level === 'intermediate'
                ? '🟡 Øvet'
                : '🔴 Ekspert'}
            </Text>
          </View>
        ) : null}

        {/* Fishing types */}
        {profile.fishing_types && profile.fishing_types.length > 0 ? (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>Fisketyper</Text>
            <View style={styles.tagsRow}>
              {profile.fishing_types.map(ft => (
                <View key={ft} style={styles.tag}>
                  <Text style={styles.tagText}>🎣 {ft}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Target species */}
        {profile.target_species && profile.target_species.length > 0 ? (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>Målarter</Text>
            <View style={styles.tagsRow}>
              {profile.target_species.slice(0, 4).map(sp => (
                <View key={sp} style={[styles.tag, styles.tagTeal]}>
                  <Text style={[styles.tagText, styles.tagTextTeal]}>{sp}</Text>
                </View>
              ))}
              {profile.target_species.length > 4 && (
                <View style={[styles.tag, styles.tagTeal]}>
                  <Text style={[styles.tagText, styles.tagTextTeal]}>
                    +{profile.target_species.length - 4}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* Car / Boat badges */}
        {(profile.has_car || profile.has_boat) ? (
          <View style={styles.badgesRow}>
            {profile.has_car && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🚗 Har bil</Text>
              </View>
            )}
            {profile.has_boat && (
              <View style={[styles.badge, styles.badgeBoat]}>
                <Text style={[styles.badgeText, styles.badgeTextBoat]}>⛵ Har båd</Text>
              </View>
            )}
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: SCREEN_WIDTH - 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 24,
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  overlayLike: {
    left: 20,
    borderColor: '#16a34a',
    transform: [{rotate: '-15deg'}],
  },
  overlayNope: {
    right: 20,
    borderColor: '#dc2626',
    transform: [{rotate: '15deg'}],
  },
  overlayTextLike: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16a34a',
  },
  overlayTextNope: {
    fontSize: 24,
    fontWeight: '800',
    color: '#dc2626',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  username: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  expBadge: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  expText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  tagsSection: {
    width: '100%',
    marginBottom: 10,
  },
  tagsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
  },
  tagTeal: {
    backgroundColor: '#f0fdfa',
  },
  tagText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  tagTextTeal: {
    color: '#0d9488',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeBoat: {
    backgroundColor: '#f0fdfa',
  },
  badgeText: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  badgeTextBoat: {
    color: '#0d9488',
  },
});
