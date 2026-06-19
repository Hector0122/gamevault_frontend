import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Game } from '../types';

interface Props {
  game: Game;
  onPress?: () => void;
}

export default function GameCard({ game, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f2937' }}>
        {game.coverUrl ? (
          <Image source={{ uri: game.coverUrl }} style={{ height: 200, width: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ height: 200, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>Sin imagen</Text>
          </View>
        )}
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
