import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useSearch, useLibrary } from '../hooks/useGames';
import GameCard from '../components/GameCard';
import StatusSelectorModal from '../components/StatusSelectorModal';
import { colors } from '../theme/colors';
import { radius, iconSize } from '../theme/tokens';
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
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    color: colors.danger,
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
          <Icon name="account-circle-outline" size={iconSize.md} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor={colors.textTertiary}
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

      {loading && <ActivityIndicator size="large" color={colors.primary} />}

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
            <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
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