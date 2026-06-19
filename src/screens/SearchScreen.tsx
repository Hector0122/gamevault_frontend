import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSearch } from '../hooks/useGames';
import GameCard from '../components/GameCard';
import type { SearchStackParamList } from '../navigation/AppNavigator';
import type { Game, IGDBGameResult } from '../types';

type SearchNav = NativeStackNavigationProp<SearchStackParamList, 'SearchList'>;

const COLS = 3;
const GAP = 10;

function toGame(igdb: IGDBGameResult): Game {
  const cover = igdb.cover?.url
    ? `https:${igdb.cover.url.replace('t_thumb', 't_cover_big')}`
    : '';

  return {
    id: String(igdb.id),
    externalId: igdb.id,
    title: igdb.name,
    description: igdb.summary ?? '',
    coverUrl: cover,
    releaseDate: igdb.first_release_date
      ? new Date(igdb.first_release_date * 1000).toISOString()
      : '',
    platforms: igdb.platforms?.map((p) => p.name) ?? [],
    genres: igdb.genres?.map((g) => g.name) ?? [],
  };
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { results, loading, error, search } = useSearch();
  const navigation = useNavigation<SearchNav>();
  const { width } = useWindowDimensions();

  const cardWidth = (width - 16 * 2 - GAP * (COLS - 1)) / COLS;

  const handlePress = useCallback(
    (game: Game) => navigation.navigate('GameDetail', { game }),
    [navigation],
  );

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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {results.map((game) => (
          <GameCard
            key={game.id}
            game={toGame(game)}
            cardWidth={cardWidth}
            onPress={() => handlePress(toGame(game))}
          />
        ))}
      </View>
    </ScrollView>
  );
}
