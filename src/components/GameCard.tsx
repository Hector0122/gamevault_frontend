import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Game } from '../types';
import { imageProxyUrl } from '../services/api';

interface Props {
  game: Game;
  cardWidth: number;
  onPress?: () => void;
}

export default function GameCard({ game, cardWidth, onPress }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ width: cardWidth, marginBottom: 12 }}>
      <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f2937' }}>
        {game.coverUrl && !failed ? (
          <Image
            source={{ uri: imageProxyUrl(game.coverUrl) }}
            style={{ width: cardWidth, height: cardWidth * 1.5 }}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={{ width: cardWidth, height: cardWidth * 1.5, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 11 }}>Sin imagen</Text>
          </View>
        )}
        <View style={{ padding: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }} numberOfLines={2}>
            {game.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
