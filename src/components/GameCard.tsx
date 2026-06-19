import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Game } from '../types';

interface Props {
  game: Game;
  onAdd?: () => void;
}

export default function GameCard({ game, onAdd }: Props) {
  const uri = game.coverUrl
    ? game.coverUrl.replace('t_thumb', 't_cover_big')
    : '';

  return (
    <View style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#1f2937' }}>
      {uri ? (
        <Image source={{ uri }} style={{ height: 200, width: '100%' }} resizeMode="cover" />
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
        {onAdd && (
          <TouchableOpacity
            onPress={onAdd}
            style={{ marginTop: 8, backgroundColor: '#059669', paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
