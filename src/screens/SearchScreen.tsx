import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSearch, useLibrary } from '../hooks/useGames';
import GameCard from '../components/GameCard';
import StatusSelectorModal from '../components/StatusSelectorModal';
import type { SearchStackParamList } from '../navigation/AppNavigator';
import type { Game, GameStatus, IGDBGameResult } from '../types';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dashboardButton: {
    color: '#34d399',
    fontSize: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 12,
  },
  contentContainer: {
    gap: 12,
  },
  footerLoader: {
    marginTop: 12,
  },
  footerSpacer: {
    height: 32,
  },
});

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { results, loading, loadingMore, error, search, loadMore, ownedIds } = useSearch();
  const { addToCollection } = useLibrary();
  const navigation = useNavigation<SearchNav>();
  const { width } = useWindowDimensions();

  const gap = 10;
  const cardWidth = (width - 32 - gap * (COLS - 1)) / COLS;

  const [quickAddGame, setQuickAddGame] = useState<Game | null>(null);

  const handlePress = useCallback(
    (game: Game) => navigation.navigate('GameDetail', { game, ownedIds }),
    [navigation, ownedIds],
  );

  const handleQuickAdd = useCallback(
    (game: Game) => setQuickAddGame(game),
    [],
  );

  async function handleQuickAddConfirm(status: GameStatus) {
    if (!quickAddGame) return;
    try {
      await addToCollection(quickAddGame.externalId, status);
      const label = { WISHLIST: 'Deseado', OWNED: 'Comprado', PLAYING: 'Jugando', COMPLETED: 'Completado', DROPPED: 'Abandonado' }[status];
      Toast.show({ type: 'success', text1: 'Agregado', text2: `${quickAddGame.title} como "${label}"`, position: 'bottom', visibilityTime: 2000 });
      setQuickAddGame(null);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo agregar el juego', position: 'bottom', visibilityTime: 2000 });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Buscar Juegos
        </Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
          <Text style={styles.dashboardButton}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => search(query)}
        />
        <TouchableOpacity
          onPress={() => search(query)}
          disabled={loading}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {loading && <ActivityIndicator size="large" color="#10b981" />}

      <FlatList
        data={results}
        numColumns={COLS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={{ gap }}
        renderItem={({ item }) => (
          <GameCard
            game={toGame(item)}
            cardWidth={cardWidth}
            onPress={() => handlePress(toGame(item))}
            owned={ownedIds.includes(item.id)}
            onQuickAdd={ownedIds.includes(item.id) ? undefined : () => handleQuickAdd(toGame(item))}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#10b981" style={styles.footerLoader} />
          ) : results.length > 0 ? (
            <View style={styles.footerSpacer} />
          ) : null
        }
      />

      <StatusSelectorModal
        visible={quickAddGame !== null}
        onSelect={handleQuickAddConfirm}
        onCancel={() => setQuickAddGame(null)}
      />
    </View>
  );
}