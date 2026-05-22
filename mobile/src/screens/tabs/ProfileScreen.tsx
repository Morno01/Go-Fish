import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {supabase} from '../../lib/supabase';
import {Profile} from '../../types';
import {Avatar} from '../../components/ui';
import {EXPERIENCE_LEVELS} from '../../lib/utils';

interface Props {
  navigation: any;
}

export default function ProfileScreen({navigation}: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;
      const {data} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProfile);
    loadProfile();
    return unsubscribe;
  }, [navigation, loadProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log ud',
      'Er du sikker på, at du vil logge ud?',
      [
        {text: 'Annuller', style: 'cancel'},
        {
          text: 'Log ud',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ],
    );
  };

  const expLabel =
    EXPERIENCE_LEVELS.find(e => e.value === profile?.experience_level)?.label ?? '';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profil ikke fundet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1d4ed8" />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Rediger</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarArea}>
            <Avatar name={profile.full_name || profile.username} size={90} />
          </View>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.location ? (
            <Text style={styles.location}>📍 {profile.location}</Text>
          ) : null}
        </View>

        <View style={styles.body}>
          {/* Bio */}
          {profile.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Om mig</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          ) : null}

          {/* Experience */}
          {expLabel ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Erfaringsniveau</Text>
              <View style={styles.expBadge}>
                <Text style={styles.expText}>
                  {profile.experience_level === 'beginner'
                    ? '🟢'
                    : profile.experience_level === 'intermediate'
                    ? '🟡'
                    : '🔴'}{' '}
                  {expLabel}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Fishing types */}
          {profile.fishing_types && profile.fishing_types.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fisketyper</Text>
              <View style={styles.chipRow}>
                {profile.fishing_types.map(ft => (
                  <View key={ft} style={styles.chip}>
                    <Text style={styles.chipText}>🎣 {ft}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Target species */}
          {profile.target_species && profile.target_species.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Målarter</Text>
              <View style={styles.chipRow}>
                {profile.target_species.map(sp => (
                  <View key={sp} style={[styles.chip, styles.chipTeal]}>
                    <Text style={[styles.chipText, styles.chipTextTeal]}>{sp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Regions */}
          {profile.regions && profile.regions.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Regioner</Text>
              <View style={styles.chipRow}>
                {profile.regions.map(r => (
                  <View key={r} style={[styles.chip, styles.chipGray]}>
                    <Text style={[styles.chipText, styles.chipTextGray]}>📍 {r}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Car / Boat */}
          {(profile.has_car || profile.has_boat) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Udstyr</Text>
              <View style={styles.chipRow}>
                {profile.has_car && (
                  <View style={styles.equipBadge}>
                    <Text style={styles.equipText}>🚗 Har bil</Text>
                  </View>
                )}
                {profile.has_boat && (
                  <View style={[styles.equipBadge, styles.equipBadgeTeal]}>
                    <Text style={[styles.equipText, styles.equipTextTeal]}>⛵ Har båd</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={styles.logoutBtnText}>Log ud</Text>
          </TouchableOpacity>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarArea: {
    marginBottom: 12,
  },
  fullName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  username: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  body: {
    padding: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
  },
  expBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expText: {
    fontSize: 15,
    color: '#166534',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipTeal: {
    backgroundColor: '#f0fdfa',
  },
  chipGray: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  chipTextTeal: {
    color: '#0d9488',
  },
  chipTextGray: {
    color: '#374151',
  },
  equipBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  equipBadgeTeal: {
    backgroundColor: '#f0fdfa',
  },
  equipText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  equipTextTeal: {
    color: '#0d9488',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
