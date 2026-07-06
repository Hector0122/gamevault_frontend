import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import type { GameStatus } from '../types';

const statuses: { key: GameStatus; label: string; color: string }[] = [
  { key: 'WISHLIST', label: 'Deseado', color: '#f59e0b' },
  { key: 'OWNED', label: 'Comprado', color: '#3b82f6' },
  { key: 'PLAYING', label: 'Jugando', color: '#10b981' },
  { key: 'COMPLETED', label: 'Completado', color: '#8b5cf6' },
  { key: 'DROPPED', label: 'Abandonado', color: '#ef4444' },
];

type Props = {
  visible: boolean;
  onSelect: (status: GameStatus) => void;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    width: 260,
  },
  title: {
    color: '#fff',
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
    borderRadius: 10,
    marginBottom: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6b7280',
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
              <View style={[styles.dot, { backgroundColor: s.color }]} />
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
