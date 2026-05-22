import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {getInitials} from '../lib/utils';

// ─── Button ────────────────────────────────────────────────────────────────

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const btnStyle = [
    styles.btn,
    variant === 'primary' && styles.btnPrimary,
    variant === 'secondary' && styles.btnSecondary,
    variant === 'danger' && styles.btnDanger,
    variant === 'outline' && styles.btnOutline,
    (disabled || loading) && styles.btnDisabled,
    style,
  ];
  const textStyle = [
    styles.btnText,
    variant === 'outline' && styles.btnTextOutline,
    variant === 'secondary' && styles.btnTextSecondary,
  ];

  return (
    <TouchableOpacity
      style={btnStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#1d4ed8' : '#ffffff'}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({label, error, style, ...props}: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.inputErrorText}>{error}</Text> : null}
    </View>
  );
}

// ─── ErrorMessage ──────────────────────────────────────────────────────────

export function ErrorMessage({message}: {message: string}) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorBoxText}>{message}</Text>
    </View>
  );
}

// ─── Chip ──────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({label, selected, onPress}: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({name, size = 44, color = '#1d4ed8'}: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2, backgroundColor: color},
      ]}>
      <Text style={[styles.avatarText, {fontSize: size * 0.38}]}>
        {getInitials(name || '?')}
      </Text>
    </View>
  );
}

// ─── SwitchRow ─────────────────────────────────────────────────────────────

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export function SwitchRow({label, value, onValueChange}: SwitchRowProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: '#d1d5db', true: '#93c5fd'}}
        thumbColor={value ? '#1d4ed8' : '#f3f4f6'}
      />
    </View>
  );
}

// ─── SectionTitle ──────────────────────────────────────────────────────────

export function SectionTitle({title}: {title: string}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Button
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8',
  },
  btnSecondary: {
    backgroundColor: '#0d9488',
  },
  btnDanger: {
    backgroundColor: '#dc2626',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1d4ed8',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnTextOutline: {
    color: '#1d4ed8',
  },
  btnTextSecondary: {
    color: '#ffffff',
  },
  // Input
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputErrorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  // Error box
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorBoxText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  // Chip
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: '#f9fafb',
  },
  chipSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#111827',
  },
  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 4,
  },
});
