import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import PageHeader from '../../components/PageHeader';
import {Button, Input, ErrorMessage, Chip} from '../../components/ui';
import {supabase} from '../../lib/supabase';
import {FISHING_TYPES, FISH_SPECIES, formatDate} from '../../lib/utils';

interface Props {
  navigation: any;
}

interface FishEntry {
  species: string;
  count: string;
  weight: string;
}

export default function JournalCreateScreen({navigation}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fishingType, setFishingType] = useState('');
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([
    {species: '', count: '1', weight: ''},
  ]);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  function addFishEntry() {
    setFishEntries(prev => [...prev, {species: '', count: '1', weight: ''}]);
  }

  function removeFishEntry(idx: number) {
    setFishEntries(prev => prev.filter((_, i) => i !== idx));
  }

  function updateFishEntry(idx: number, field: keyof FishEntry, value: string) {
    setFishEntries(prev =>
      prev.map((entry, i) => (i === idx ? {...entry, [field]: value} : entry)),
    );
  }

  const handleSave = async () => {
    if (!location.trim()) {
      setError('Angiv venligst en lokation.');
      return;
    }
    if (!fishingType) {
      setError('Vælg venligst en fisketype.');
      return;
    }

    const validFish = fishEntries
      .filter(f => f.species.trim())
      .map(f => ({
        species: f.species.trim(),
        count: parseInt(f.count, 10) || 1,
        weight: f.weight ? parseFloat(f.weight) : undefined,
      }));

    setLoading(true);
    setError('');

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
      setError('Ikke logget ind.');
      setLoading(false);
      return;
    }

    const {error: insertError} = await supabase.from('journal_entries').insert({
      user_id: user.id,
      location: location.trim(),
      date: date.toISOString(),
      fishing_type: fishingType,
      fish_caught: validFish.length > 0 ? validFish : null,
      weather: weather.trim() || null,
      temperature: temperature ? parseFloat(temperature) : null,
      notes: notes.trim() || null,
      is_public: isPublic,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader title="Ny fangst" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <ErrorMessage message={error} />

          {/* Location */}
          <Input
            label="Lokation *"
            placeholder="F.eks. Gudenåen, Silkeborg"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="sentences"
          />

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Dato</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}>
              <Text style={styles.datePickerText}>📅 {formatDate(date.toISOString())}</Text>
              <Text style={styles.datePickerArrow}>›</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Fishing type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fisketype *</Text>
            <View style={styles.chipGrid}>
              {FISHING_TYPES.map(ft => (
                <Chip
                  key={ft.value}
                  label={ft.label}
                  selected={fishingType === ft.value}
                  onPress={() => setFishingType(ft.value)}
                />
              ))}
            </View>
          </View>

          {/* Fish caught */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fisk fanget</Text>
            {fishEntries.map((entry, idx) => (
              <View key={idx} style={styles.fishEntryCard}>
                <View style={styles.fishEntryHeader}>
                  <Text style={styles.fishEntryTitle}>Fangst {idx + 1}</Text>
                  {fishEntries.length > 1 && (
                    <TouchableOpacity onPress={() => removeFishEntry(idx)}>
                      <Text style={styles.removeBtn}>Fjern</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.label}>Art</Text>
                <View style={styles.speciesChipGrid}>
                  {FISH_SPECIES.slice(0, 10).map(sp => (
                    <TouchableOpacity
                      key={sp}
                      style={[
                        styles.speciesChip,
                        entry.species === sp && styles.speciesChipActive,
                      ]}
                      onPress={() => updateFishEntry(idx, 'species', sp)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.speciesChipText,
                          entry.species === sp && styles.speciesChipTextActive,
                        ]}>
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.fishEntryRow}>
                  <View style={styles.fishEntryField}>
                    <Input
                      label="Antal"
                      placeholder="1"
                      value={entry.count}
                      onChangeText={v => updateFishEntry(idx, 'count', v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.fishEntryField}>
                    <Input
                      label="Vægt (kg, valgfrit)"
                      placeholder="0.5"
                      value={entry.weight}
                      onChangeText={v => updateFishEntry(idx, 'weight', v)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addFishBtn} onPress={addFishEntry} activeOpacity={0.8}>
              <Text style={styles.addFishBtnText}>+ Tilføj fisk</Text>
            </TouchableOpacity>
          </View>

          {/* Weather */}
          <Input
            label="Vejr (valgfrit)"
            placeholder="F.eks. Sol, let skyet"
            value={weather}
            onChangeText={setWeather}
            autoCapitalize="sentences"
          />

          {/* Temperature */}
          <Input
            label="Lufttemperatur °C (valgfrit)"
            placeholder="15"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
          />

          {/* Notes */}
          <Input
            label="Noter (valgfrit)"
            placeholder="Dagens oplevelser, tip til stedet..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
            autoCapitalize="sentences"
          />

          {/* Public toggle */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Gør fangst offentlig</Text>
              <Text style={styles.switchSubLabel}>
                Andre fiskere kan se denne fangst
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{false: '#d1d5db', true: '#93c5fd'}}
              thumbColor={isPublic ? '#1d4ed8' : '#f3f4f6'}
            />
          </View>

          <Button
            title="Gem fangst"
            onPress={handleSave}
            loading={loading}
            variant="secondary"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#ffffff'},
  flex: {flex: 1},
  content: {padding: 20},
  section: {marginBottom: 16},
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
  },
  datePickerText: {fontSize: 16, color: '#111827'},
  datePickerArrow: {fontSize: 22, color: '#6b7280'},
  chipGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  fishEntryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fishEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fishEntryTitle: {fontSize: 14, fontWeight: '700', color: '#374151'},
  removeBtn: {fontSize: 13, color: '#dc2626', fontWeight: '600'},
  speciesChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  speciesChip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
    backgroundColor: '#ffffff',
  },
  speciesChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  speciesChipText: {fontSize: 12, color: '#374151', fontWeight: '500'},
  speciesChipTextActive: {color: '#ffffff'},
  fishEntryRow: {flexDirection: 'row', gap: 10},
  fishEntryField: {flex: 1},
  addFishBtn: {
    borderWidth: 1.5,
    borderColor: '#1d4ed8',
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
  },
  addFishBtnText: {color: '#1d4ed8', fontSize: 15, fontWeight: '600'},
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 20,
  },
  switchLabel: {fontSize: 16, color: '#111827', fontWeight: '600'},
  switchSubLabel: {fontSize: 13, color: '#6b7280', marginTop: 2},
  submitBtn: {marginBottom: 24},
});
