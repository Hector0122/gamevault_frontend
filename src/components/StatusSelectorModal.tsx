import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors, statusDotColors } from '../theme/colors';
import { radius } from '../theme/tokens';
import type { GameStatus } from '../types';

const statuses: { key: GameStatus; label: string }[] = [
  { key: 'WISHLIST', label: 'Deseado' },
  { key: 'OWNED', label: 'Comprado' },
  { key: 'PLAYING', label: 'Jugando' },
  { key: 'COMPLETED', label: 'Completado' },
  { key: 'DROPPED', label: 'Abandonado' },
];

type Props = {
  visible: boolean;
  onSelect: (status: GameStatus) => void;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: 20,
    width: 260,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: colors.text,
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
});

export default function StatusSelectorModal({
  visible,
  onSelect,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Agregar como...</Text>
          {statuses.map(s => (
            <TouchableOpacity
              key={s.key}
              onPress={() => onSelect(s.key)}
              style={styles.statusItem}
            >
              <View style={[styles.dot, { backgroundColor: statusDotColors[s.key] }]} />
              <Text style={styles.statusText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
