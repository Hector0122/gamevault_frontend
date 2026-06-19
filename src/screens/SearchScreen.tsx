import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSearch } from '../hooks/useGames';
import GameCard from '../components/GameCard';
import type { SearchStackParamList } from '../navigation/AppNavigator';
import type { Game } from '../types';

type SearchNav = NativeStackNavigationProp<SearchStackParamList, 'SearchList'>;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { results, loading, error, search } = useSearch();
  const navigation = useNavigation<SearchNav>();

  function handlePress(gameData: Game) {
    navigation.navigate('GameDetail', { game: gameData });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#030712', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Buscar Juegos
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#111827',
            borderWidth: 1,
            borderColor: '#374151',
            borderRadius: 8,
            paddingHorizontal: 16,
            color: '#fff',
          }}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => search(query)}
        />
        <TouchableOpacity
          onPress={() => search(query)}
          disabled={loading}
          style={{
            backgroundColor: '#059669',
            paddingHorizontal: 20,
            borderRadius: 8,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '500' }}>
            {loading ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={{ color: '#f87171', marginBottom: 12 }}>{error}</Text>
      )}

      {loading && <ActivityIndicator size="large" color="#10b981" />}

      {results.map((game) => (
        <GameCard
          key={game.id}
          game={{
            id: String(game.id),
            externalId: game.id,
            title: game.name,
            description: game.summary ?? '',
            coverUrl: game.cover?.url
              ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
              : '',
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toISOString()
              : '',
            platforms: game.platforms?.map((p) => p.name) ?? [],
            genres: game.genres?.map((g) => g.name) ?? [],
          }}
          onPress={() =>
            handlePress({
              id: String(game.id),
              externalId: game.id,
              title: game.name,
              description: game.summary ?? '',
              coverUrl: game.cover?.url
                ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
                : '',
              releaseDate: game.first_release_date
                ? new Date(game.first_release_date * 1000).toISOString()
                : '',
              platforms: game.platforms?.map((p) => p.name) ?? [],
              genres: game.genres?.map((g) => g.name) ?? [],
            })
          }
        />
      ))}
    </ScrollView>
  );
}
