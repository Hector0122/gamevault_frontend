import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearch } from '../hooks/useGames';
import GameCard from '../components/GameCard';
import type { SearchStackParamList } from '../navigation/AppNavigator';
import type { Game, IGDBGameResult } from '../types';

type SearchNav = NativeStackNavigationProp<SearchStackParamList, 'SearchList'>;

const COLS = 3;

function toGame(igdb: IGDBGameResult): Game {
  const cover = igdb.cover?.url
    ? `https:${igdb.cover.url.replace('t_thumb', 't_cover_big')}`
    : '';
  const ttb = igdb.time_to_beat;

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
    timeToBeatHastly: ttb?.hastily ? Math.round(ttb.hastily / 60) : null,
    timeToBeatNormally: ttb?.normally ? Math.round(ttb.normally / 60) : null,
    timeToBeatCompletely: ttb?.completely ? Math.round(ttb.completely / 60) : null,
  };
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { results, loading, loadingMore, error, search, loadMore } = useSearch();
  const navigation = useNavigation<SearchNav>();
  const { width } = useWindowDimensions();

  const gap = 10;
  const cardWidth = (width - 32 - gap * (COLS - 1)) / COLS;

  const handlePress = useCallback(
    (game: Game) => navigation.navigate('GameDetail', { game }),
    [navigation],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
          Buscar Juegos
        </Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
          <Text style={{ color: '#34d399', fontSize: 20 }}>📊</Text>
        </TouchableOpacity>
      </View>

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

      <FlatList
        data={results}
        numColumns={COLS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12 }}
        columnWrapperStyle={{ gap }}
        renderItem={({ item }) => (
          <GameCard
            game={toGame(item)}
            cardWidth={cardWidth}
            onPress={() => handlePress(toGame(item))}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#10b981" style={{ marginTop: 12 }} />
          ) : results.length > 0 ? (
            <View style={{ height: 32 }} />
          ) : null
        }
      />
    </View>
  );
}
