import { View, Text, StyleSheet } from 'react-native';
import type { GameStatus } from '../types';

const config: Record<GameStatus, { bg: string; text: string; label: string }> =
  {
    WISHLIST: { bg: '#4c1d95', text: '#d8b4fe', label: 'Deseado' },
    OWNED: { bg: '#1e3a5f', text: '#93c5fd', label: 'Comprado' },
    PLAYING: { bg: '#14532d', text: '#86efac', label: 'Jugando' },
    COMPLETED: { bg: '#064e3b', text: '#6ee7b7', label: 'Completado' },
    DROPPED: { bg: '#7f1d1d', text: '#fca5a5', label: 'Abandonado' },
  };

interface Props {
  status: GameStatus;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default function StatusBadge({ status }: Props) {
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
