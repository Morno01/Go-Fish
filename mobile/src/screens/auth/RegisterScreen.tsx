import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {Button, Input, ErrorMessage, Chip} from '../../components/ui';
import {supabase} from '../../lib/supabase';
import {
  FISHING_TYPES,
  FISH_SPECIES,
  REGIONS,
  EXPERIENCE_LEVELS,
} from '../../lib/utils';

interface Props {
  navigation: any;
}

export default function RegisterScreen({navigation}: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  // Step 2
  const [fishingTypes, setFishingTypes] = useState<string[]>([]);
  const [targetSpecies, setTargetSpecies] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('');

  // Step 3
  const [regions, setRegions] = useState<string[]>([]);
  const [hasCar, setHasCar] = useState(false);
  const [hasBoat, setHasBoat] = useState(false);

  function toggleItem(arr: string[], setArr: (v: string[]) => void, val: string) {
    if (arr.includes(val)) {
      setArr(arr.filter(i => i !== val));
    } else {
      setArr([...arr, val]);
    }
  }

  function validateStep1(): boolean {
    if (!email.trim() || !password || !username.trim() || !fullName.trim()) {
      setError('Udfyld venligst alle felter.');
      return false;
    }
    if (password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn.');
      return false;
    }
    if (username.length < 3) {
      setError('Brugernavn skal være mindst 3 tegn.');
      return false;
    }
    return true;
  }

  async function handleRegister() {
    setLoading(true);
    setError('');

    const {data: signUpData, error: signUpError} = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setError(signUpError?.message ?? 'Registrering mislykkedes. Prøv igen.');
      return;
    }

    // Upsert profile
    const {error: profileError} = await supabase.from('profiles').upsert({
      id: signUpData.user.id,
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      full_name: fullName.trim(),
      fishing_types: fishingTypes,
      target_species: targetSpecies,
      experience_level: experienceLevel || null,
      regions,
      has_car: hasCar,
      has_boat: hasBoat,
    });

    setLoading(false);

    if (profileError) {
      setError('Profil kunne ikke gemmes: ' + profileError.message);
      return;
    }
    // Auth state change triggers navigation
  }

  function goNext() {
    setError('');
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  }

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title="Opret konto" onBack={() => navigation.goBack()} />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: progressWidth as any}]} />
      </View>
      <Text style={styles.stepLabel}>Trin {step} af 3</Text>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <ErrorMessage message={error} />

          {/* ── Step 1: Konto ── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Konto oplysninger</Text>

              <Input
                label="Fulde navn"
                placeholder="Jens Jensen"
                value={fullName}
                onChangeText={setFullName}
                textContentType="name"
                autoCapitalize="words"
              />
              <Input
                label="Brugernavn"
                placeholder="jens_fisker"
                value={username}
                onChangeText={setUsername}
              />
              <Input
                label="E-mail"
                placeholder="din@email.dk"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <Input
                label="Adgangskode (min. 6 tegn)"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>
          )}

          {/* ── Step 2: Fiskerier ── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Dine fiskerier</Text>

              <Text style={styles.sectionLabel}>Fisketyper</Text>
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

              <Text style={styles.sectionLabel}>Målarter</Text>
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

              <Text style={styles.sectionLabel}>Erfaringsniveau</Text>
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
          )}

          {/* ── Step 3: Regioner ── */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Lokation & udstyr</Text>

              <Text style={styles.sectionLabel}>Regioner</Text>
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

              <View style={styles.switchSection}>
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
            </View>
          )}

          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setError('');
                  setStep(step - 1);
                }}>
                <Text style={styles.backBtnText}>← Tilbage</Text>
              </TouchableOpacity>
            )}
            <View style={styles.nextBtnWrap}>
              {step < 3 ? (
                <Button title="Næste →" onPress={goNext} />
              ) : (
                <Button
                  title="Opret konto"
                  onPress={handleRegister}
                  loading={loading}
                  variant="secondary"
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 0,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1d4ed8',
    borderRadius: 2,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    paddingVertical: 8,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  switchSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  nextBtnWrap: {
    flex: 1,
  },
});
