import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {label: string; onPress: () => void};
}

export default function PageHeader({title, onBack, rightAction}: PageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4)},
      ]}>
      <View style={styles.row}>
        {/* Left: back button or spacer */}
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backText}>← Tilbage</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center: title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Right: optional action */}
        <View style={[styles.side, styles.sideRight]}>
          {rightAction ? (
            <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7}>
              <Text style={styles.rightText}>{rightAction.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1d4ed8',
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  side: {
    width: 90,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  rightText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
