import { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLibrary } from '../hooks/useGames';
import StatusBadge from '../components/StatusBadge';
import type { GameStatus } from '../types';
import { imageProxyUrl } from '../services/api';

const statuses: GameStatus[] = ['WISHLIST', 'OWNED', 'PLAYING', 'COMPLETED', 'DROPPED'];

export default function LibraryScreen() {
  const { games, loading, fetchLibrary, changeStatus } = useLibrary();

  useEffect(() => {
    fetchLibrary();
  }, []);

  if (loading && games.length === 0) {
    return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />;
  }

  if (games.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#9ca3af', fontSize: 16 }}>
          Aún no tienes juegos. Busca y agrega desde la sección Buscar.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#030712', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Biblioteca ({games.length})
      </Text>

      {games.map((userGame) => (
        <View
          key={userGame.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#111827',
            borderWidth: 1,
            borderColor: '#1f2937',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
          }}
        >
          {userGame.game.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(userGame.game.coverUrl) }}
              style={{ width: 60, height: 80, borderRadius: 4 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: 60, height: 80, backgroundColor: '#374151', borderRadius: 4 }} />
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              {userGame.game.title}
            </Text>
            <StatusBadge status={userGame.status} />
          </View>

          <TouchableOpacity
            onPress={() => {
              const idx = statuses.indexOf(userGame.status);
              const nextStatus = (idx + 1) % statuses.length;
              changeStatus(userGame.gameId, statuses[nextStatus]);
            }}
            style={{ backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ color: '#d1d5db', fontSize: 12 }}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
