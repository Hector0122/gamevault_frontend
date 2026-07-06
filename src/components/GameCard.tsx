import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Game } from '../types';
import { imageProxyUrl } from '../services/api';

interface Props {
  game: Game;
  cardWidth: number;
  onPress?: () => void;
  owned?: boolean;
  onQuickAdd?: () => void;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  placeholder: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 11,
  },
  ownedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  quickAddButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#059669',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  titleContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

export default function GameCard({
  game,
  cardWidth,
  onPress,
  owned,
  onQuickAdd,
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: cardWidth }}
    >
      <View style={styles.card}>
        {game.coverUrl && !failed ? (
          <Image
            source={{ uri: imageProxyUrl(game.coverUrl) }}
            style={{ width: cardWidth, height: cardWidth * 1.5 }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: cardWidth, height: cardWidth * 1.5 },
            ]}
          >
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
        {owned && (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedBadgeText}>✓</Text>
          </View>
        )}
        {!owned && onQuickAdd && (
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation?.();
              onQuickAdd();
            }}
            style={styles.quickAddButton}
          >
            <Text style={styles.quickAddText}>+</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {game.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
