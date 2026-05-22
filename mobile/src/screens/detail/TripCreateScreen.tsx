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

type TripType = 'samkørsel' | 'meetup';

export default function TripCreateScreen({navigation}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tripType, setTripType] = useState<TripType>('meetup');
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fishingType, setFishingType] = useState('');
  const [targetSpecies, setTargetSpecies] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [pricePerPerson, setPricePerPerson] = useState('0');
  const [description, setDescription] = useState('');

  function toggleSpecies(sp: string) {
    if (targetSpecies.includes(sp)) {
      setTargetSpecies(prev => prev.filter(s => s !== sp));
    } else {
      setTargetSpecies(prev => [...prev, sp]);
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !destination.trim() || !fishingType) {
      setError('Udfyld venligst titel, destination og fisketype.');
      return;
    }
    const max = parseInt(maxParticipants, 10);
    if (isNaN(max) || max < 1 || max > 50) {
      setError('Max deltagere skal være mellem 1 og 50.');
      return;
    }
    const price = parseFloat(pricePerPerson) || 0;

    setLoading(true);
    setError('');

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
      setError('Ikke logget ind.');
      setLoading(false);
      return;
    }

    const {error: insertError} = await supabase.from('trips').insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      trip_type: tripType,
      fishing_type: fishingType,
      target_species: targetSpecies.length > 0 ? targetSpecies : null,
      destination: destination.trim(),
      date: date.toISOString(),
      max_participants: max,
      current_participants: 0,
      price_per_person: price,
      status: 'active',
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
      <PageHeader title="Opret tur" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <ErrorMessage message={error} />

          {/* Trip type toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Turtype</Text>
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  tripType === 'meetup' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setTripType('meetup')}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.typeToggleText,
                    tripType === 'meetup' && styles.typeToggleTextActive,
                  ]}>
                  📍 Meetup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  tripType === 'samkørsel' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setTripType('samkørsel')}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.typeToggleText,
                    tripType === 'samkørsel' && styles.typeToggleTextActive,
                  ]}>
                  🚗 Samkørsel
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Input
            label="Titel"
            placeholder="F.eks. Laksefiskeri ved Gudenåen"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="sentences"
          />

          {/* Destination */}
          <Input
            label="Destination"
            placeholder="F.eks. Gudenåen, Silkeborg"
            value={destination}
            onChangeText={setDestination}
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
                minimumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Fishing type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fisketype</Text>
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

          {/* Target species */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Målarter (valgfrit)</Text>
            <View style={styles.chipGrid}>
              {FISH_SPECIES.map(sp => (
                <Chip
                  key={sp}
                  label={sp}
                  selected={targetSpecies.includes(sp)}
                  onPress={() => toggleSpecies(sp)}
                />
              ))}
            </View>
          </View>

          {/* Max participants */}
          <Input
            label="Maks deltagere"
            placeholder="4"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
          />

          {/* Price */}
          <Input
            label="Pris per person (0 = gratis)"
            placeholder="0"
            value={pricePerPerson}
            onChangeText={setPricePerPerson}
            keyboardType="decimal-pad"
          />

          {/* Description */}
          <Input
            label="Beskrivelse (valgfrit)"
            placeholder="Fortæl lidt om turen, mødested, hvad der er inkluderet..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
            autoCapitalize="sentences"
          />

          <Button
            title="Opret tur"
            onPress={handleCreate}
            loading={loading}
            style={styles.submitBtn}
          />
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
  flex: {flex: 1},
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
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
  typeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeToggleBtnActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  typeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeToggleTextActive: {
    color: '#ffffff',
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
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  datePickerArrow: {
    fontSize: 22,
    color: '#6b7280',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
