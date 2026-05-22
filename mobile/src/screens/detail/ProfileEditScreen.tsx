import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {Button, Input, ErrorMessage, Chip} from '../../components/ui';
import {supabase} from '../../lib/supabase';
import {Profile} from '../../types';
import {
  FISHING_TYPES,
  FISH_SPECIES,
  REGIONS,
  EXPERIENCE_LEVELS,
} from '../../lib/utils';

interface Props {
  navigation: any;
}

export default function ProfileEditScreen({navigation}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [fishingTypes, setFishingTypes] = useState<string[]>([]);
  const [targetSpecies, setTargetSpecies] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [hasCar, setHasCar] = useState(false);
  const [hasBoat, setHasBoat] = useState(false);

  const loadProfile = useCallback(async () => {
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return;

    const {data} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      const p: Profile = data;
      setFullName(p.full_name ?? '');
      setUsername(p.username ?? '');
      setLocation(p.location ?? '');
      setBio(p.bio ?? '');
      setFishingTypes(p.fishing_types ?? []);
      setTargetSpecies(p.target_species ?? []);
      setRegions(p.regions ?? []);
      setExperienceLevel(p.experience_level ?? '');
      setHasCar(p.has_car ?? false);
      setHasBoat(p.has_boat ?? false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function toggleItem(arr: string[], setArr: (v: string[]) => void, val: string) {
    if (arr.includes(val)) {
      setArr(arr.filter(i => i !== val));
    } else {
      setArr([...arr, val]);
    }
  }

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Udfyld venligst navn og brugernavn.');
      return;
    }

    setSaving(true);
    setError('');

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
      setError('Ikke logget ind.');
      setSaving(false);
      return;
    }

    const {error: updateError} = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        location: location.trim() || null,
        bio: bio.trim() || null,
        fishing_types: fishingTypes,
        target_species: targetSpecies,
        regions,
        experience_level: experienceLevel || null,
        has_car: hasCar,
        has_boat: hasBoat,
      })
      .eq('id', user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <PageHeader title="Rediger profil" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color="#1d4ed8" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title="Rediger profil" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <ErrorMessage message={error} />

          {/* Basic info */}
          <Text style={styles.sectionTitle}>Grundlæggende info</Text>

          <Input
            label="Fulde navn"
            placeholder="Jens Jensen"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Input
            label="Brugernavn"
            placeholder="jens_fisker"
            value={username}
            onChangeText={setUsername}
          />
          <Input
            label="Lokation"
            placeholder="F.eks. Aarhus"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="sentences"
          />
          <Input
            label="Bio"
            placeholder="Fortæl lidt om dig selv og din fiskestil..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
            autoCapitalize="sentences"
          />

          {/* Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Erfaringsniveau</Text>
            <View style={styles.chipGrid}>
              {EXPERIENCE_LEVELS.map(lvl => (
                <Chip
                  key={lvl.value}
                  label={lvl.label}
                  selected={experienceLevel === lvl.value}
                  onPress={() => setExperienceLevel(lvl.value)}
                />
              ))}
            </View>
          </View>

          {/* Fishing types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fisketyper</Text>
            <View style={styles.chipGrid}>
              {FISHING_TYPES.map(ft => (
                <Chip
                  key={ft.value}
                  label={ft.label}
                  selected={fishingTypes.includes(ft.value)}
                  onPress={() => toggleItem(fishingTypes, setFishingTypes, ft.value)}
                />
              ))}
            </View>
          </View>

          {/* Target species */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Målarter</Text>
            <View style={styles.chipGrid}>
              {FISH_SPECIES.map(sp => (
                <Chip
                  key={sp}
                  label={sp}
                  selected={targetSpecies.includes(sp)}
                  onPress={() => toggleItem(targetSpecies, setTargetSpecies, sp)}
                />
              ))}
            </View>
          </View>

          {/* Regions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regioner</Text>
            <View style={styles.chipGrid}>
              {REGIONS.map(r => (
                <Chip
                  key={r}
                  label={r}
                  selected={regions.includes(r)}
                  onPress={() => toggleItem(regions, setRegions, r)}
                />
              ))}
            </View>
          </View>

          {/* Car / Boat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Udstyr</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>🚗 Har bil</Text>
              <Switch
                value={hasCar}
                onValueChange={setHasCar}
                trackColor={{false: '#d1d5db', true: '#93c5fd'}}
                thumbColor={hasCar ? '#1d4ed8' : '#f3f4f6'}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>⛵ Har båd</Text>
              <Switch
                value={hasBoat}
                onValueChange={setHasBoat}
                trackColor={{false: '#d1d5db', true: '#93c5fd'}}
                thumbColor={hasBoat ? '#1d4ed8' : '#f3f4f6'}
              />
            </View>
          </View>

          <Button
            title="Gem ændringer"
            onPress={handleSave}
            loading={saving}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#ffffff'},
  flex: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 20},
  section: {marginBottom: 16},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {fontSize: 16, color: '#111827'},
  saveBtn: {marginTop: 16, marginBottom: 32},
});
