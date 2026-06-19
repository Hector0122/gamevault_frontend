import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import type { Game } from '../types';

interface Props {
  game: Game;
  onPress?: () => void;
}

export default function GameCard({ game, onPress }: Props) {
  const { width } = useWindowDimensions();
  const [failed, setFailed] = useState(false);
  const cardWidth = width - 32;

  if (!game.coverUrl || failed) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f2937' }}>
          <View style={{ height: 200, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>Sin imagen</Text>
          </View>
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{game.title}</Text>
            {game.genres.length > 0 && (
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                {game.genres.join(', ')}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f2937' }}>
        <Image
          source={{ uri: game.coverUrl }}
          style={{ height: 200, width: cardWidth }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{game.title}</Text>
          {game.genres.length > 0 && (
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {game.genres.join(', ')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
