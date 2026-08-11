import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '../theme/colors';
import { radius } from '../theme/tokens';
import type { GameStatus } from '../types';

interface Props {
  status: GameStatus;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default function StatusBadge({ status }: Props) {
  const c = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
