import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/PageHeader';
import {Button, Input, ErrorMessage} from '../../components/ui';
import {supabase} from '../../lib/supabase';

interface Props {
  navigation: any;
}

export default function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Udfyld venligst e-mail og adgangskode.');
      return;
    }
    setLoading(true);
    setError('');
    const {error: authError} = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(
        authError.message.includes('Invalid')
          ? 'Forkert e-mail eller adgangskode.'
          : authError.message,
      );
    }
    // Navigation handled by onAuthStateChange in navigator
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <PageHeader
        title="Log ind"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={styles.subtitle}>
            Velkommen tilbage til Go-Fish 🎣
          </Text>

          <ErrorMessage message={error} />

          <Input
            label="E-mail"
            placeholder="din@email.dk"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <Input
            label="Adgangskode"
            placeholder="Din adgangskode"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <Button
            title="Log ind"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              Ingen konto?{' '}
              <Text style={styles.registerLinkBold}>Opret her</Text>
            </Text>
          </TouchableOpacity>
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
  content: {
    padding: 24,
    paddingTop: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  loginBtn: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 15,
    color: '#6b7280',
  },
  registerLinkBold: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
