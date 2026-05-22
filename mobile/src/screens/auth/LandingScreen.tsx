import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

export default function LandingScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1d4ed8', '#0d9488']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40},
        ]}
        showsVerticalScrollIndicator={false}>

        {/* Logo area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🐟</Text>
          <Text style={styles.appName}>Go-Fish</Text>
          <Text style={styles.tagline}>Find din næste fiskemakker</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.featurePills}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>🎣 Matchmaking</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>🚗 Samkørsel</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>💬 Chat</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Mød ligesindede fiskere, del ture og del transport.{'\n'}
          Danmarks sociale fiske-app.
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Log ind</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}>
            <Text style={styles.registerBtnText}>Opret konto</Text>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        <Text style={styles.footer}>
          Ved at oprette en konto accepterer du vores vilkår og betingelser.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 6,
    textAlign: 'center',
  },
  featurePills: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  buttons: {
    width: '100%',
    gap: 14,
  },
  loginBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#1d4ed8',
    fontSize: 17,
    fontWeight: '700',
  },
  registerBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
  },
});
