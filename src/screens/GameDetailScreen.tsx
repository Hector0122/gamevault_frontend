import { View, Text, Image, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { useLibrary } from '../hooks/useGames';
import type { GameStatus } from '../types';
import type { SearchStackParamList } from '../navigation/AppNavigator';

const statuses: { key: GameStatus; label: string }[] = [
  { key: 'WISHLIST', label: 'Deseado' },
  { key: 'OWNED', label: 'Comprado' },
  { key: 'PLAYING', label: 'Jugando' },
  { key: 'COMPLETED', label: 'Completado' },
  { key: 'DROPPED', label: 'Abandonado' },
];

export default function GameDetailScreen() {
  const route = useRoute<RouteProp<SearchStackParamList, 'GameDetail'>>();
  const navigation = useNavigation();
  const { game } = route.params;
  const { addToCollection } = useLibrary();
  const { width } = useWindowDimensions();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>('OWNED');
  const [imgFailed, setImgFailed] = useState(false);

  async function handleAdd() {
    try {
      await addToCollection(game.externalId);
      Alert.alert('Agregado', `${game.title} agregado como "${statuses.find(s => s.key === selectedStatus)?.label}"`);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo agregar el juego');
    }
  }

  const releaseYear = game.releaseDate
    ? new Date(game.releaseDate).getFullYear()
    : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#030712' }}>
      {game.coverUrl && !imgFailed ? (
        <Image
          source={{ uri: game.coverUrl }}
          style={{ width, height: 300 }}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <View style={{ width, height: 300, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#9ca3af' }}>Sin imagen</Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          {game.title}
        </Text>

        {releaseYear && (
          <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>
            Lanzamiento: {releaseYear}
          </Text>
        )}

        {game.genres.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {game.genres.map((g) => (
              <View key={g} style={{ backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#d1d5db', fontSize: 12 }}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {game.platforms.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Plataformas</Text>
            <Text style={{ color: '#d1d5db', fontSize: 14 }}>{game.platforms.join(', ')}</Text>
          </View>
        )}

        {game.description ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Sinopsis</Text>
            <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 20 }}>{game.description}</Text>
          </View>
        ) : null}

        <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Estado
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {statuses.map((s) => {
            const active = selectedStatus === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSelectedStatus(s.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: active ? '#059669' : '#374151',
                  backgroundColor: active ? '#065f46' : 'transparent',
                }}
              >
                <Text style={{ color: active ? '#fff' : '#9ca3af', fontWeight: active ? '600' : '400' }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleAdd}
          style={{ backgroundColor: '#059669', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Agregar a colección</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
