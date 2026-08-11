import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLibrary } from '../hooks/useGames';
import type { GameStatus, Priority, UserGame } from '../types';
import { imageProxyUrl, exportUrl } from '../services/api';
import type { LibraryStackParamList } from '../navigation/AppNavigator';
import { colors, statusDotColors } from '../theme/colors';
import { hues, radius } from '../theme/tokens';

type LibraryNav = NativeStackNavigationProp<
  LibraryStackParamList,
  'LibraryList'
>;

// Mismo mapeo que StatusBadge/StatusSelectorModal — antes esta pantalla traía
// su PROPIA tercera copia del color por estado (coincidía con el selector,
// pero era una tercera fuente de verdad suelta). Ahora las tres leen de
// `statusDotColors` en theme/colors.ts.
const statuses: { key: GameStatus; label: string; color: string }[] = [
  { key: 'WISHLIST', label: 'Deseado', color: statusDotColors.WISHLIST },
  { key: 'OWNED', label: 'Comprado', color: statusDotColors.OWNED },
  { key: 'PLAYING', label: 'Jugando', color: statusDotColors.PLAYING },
  { key: 'COMPLETED', label: 'Completado', color: statusDotColors.COMPLETED },
  { key: 'DROPPED', label: 'Abandonado', color: statusDotColors.DROPPED },
];

type SortKey = 'title' | 'recent' | 'hours' | 'rating';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Reciente' },
  { key: 'title', label: 'A-Z' },
  { key: 'hours', label: 'Horas' },
  { key: 'rating', label: 'Rating' },
];

const priorityCycle: (Priority | null)[] = [null, 'HIGH', 'MEDIUM', 'LOW'];

const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: '!!', color: colors.danger },
  MEDIUM: { label: '!', color: colors.accent },
  LOW: { label: '↓', color: colors.textTertiary },
};

function Stars({
  rating,
  onPress,
}: {
  rating: number;
  onPress?: (r: number) => void;
}) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity
          key={i}
          onPress={() => onPress?.(i)}
          disabled={!onPress}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.starText,
              i <= rating ? styles.starActive : styles.starInactive,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = { paddingTop: insets.top + 16 };
  const navigation = useNavigation<LibraryNav>();
  const {
    games,
    total,
    loading,
    loadingMore,
    isOffline,
    pendingMutationCount,
    fetchLibrary,
    loadMore,
    changeStatus,
    updateHours,
    updateNotes,
    removeGame,
    updatePriority,
    searchQuery,
    setSearchQuery,
    libraryTotalCount,
    libraryTotalCountInitialized,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    genreFilter,
    setGenreFilter,
    sortKey,
    setSortKey,
  } = useLibrary();

  const [showFilters, setShowFilters] = useState(false);
  const [editingHours, setEditingHours] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const fetchLibraryRef = useRef(fetchLibrary);
  fetchLibraryRef.current = fetchLibrary;

  useFocusEffect(
    useCallback(() => {
      fetchLibraryRef.current(true);
    }, []),
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter || platformFilter || genreFilter;

  const prevHasActiveFilters = useRef(hasActiveFilters);
  useEffect(() => {
    if (prevHasActiveFilters.current && !hasActiveFilters) {
      fetchLibrary(true);
    }
    prevHasActiveFilters.current = hasActiveFilters;
  }, [hasActiveFilters, fetchLibrary]);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => g.game.platforms.forEach(p => set.add(p)));
    return Array.from(set).sort();
  }, [games]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => g.game.genres.forEach(gn => set.add(gn)));
    return Array.from(set).sort();
  }, [games]);

  const activeFilterCount = useMemo(
    () => [statusFilter, platformFilter, genreFilter].filter(Boolean).length,
    [statusFilter, platformFilter, genreFilter],
  );

  function handleFilterChange<T>(setter: (v: T) => void, value: T) {
    setter(value);
  }

  async function handleSaveHours(gameId: string) {
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours < 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Ingresa un número válido',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }
    try {
      await updateHours(gameId, hours);
      setEditingHours(null);
      setHoursInput('');
      Toast.show({
        type: 'success',
        text1: 'Horas guardadas',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron guardar las horas',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }

  async function handleSaveNotes(gameId: string) {
    try {
      await updateNotes(gameId, { notes: notesInput || null });
      setEditingNotes(null);
      setNotesInput('');
      Toast.show({
        type: 'success',
        text1: 'Notas guardadas',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron guardar las notas',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }

  async function handleRating(gameId: string, rating: number) {
    await updateNotes(gameId, { rating }, true);
  }

  function handleDelete(gameId: string, title: string) {
    Alert.alert('Eliminar juego', `¿Eliminar "${title}" de la biblioteca?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeGame(gameId),
      },
    ]);
  }

  function handleGamePress(userGame: UserGame) {
    navigation.navigate('GameDetail', { game: userGame.game, userGame });
  }

  if (loading && games.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loadingIndicator}
      />
    );
  }

  if (
    !loading &&
    !hasActiveFilters &&
    libraryTotalCount === 0 &&
    libraryTotalCountInitialized
  ) {
    return (
      <View style={[styles.emptyContainer, topPadding]}>
        <Text style={styles.emptyText}>
          Aún no tienes juegos. Busca y agrega desde la sección Buscar.
        </Text>
      </View>
    );
  }

  function renderGame({ item: userGame }: { item: UserGame }) {
    const activeStatus = statuses.find(s => s.key === userGame.status)!;
    const gamePlatforms = userGame.game.platforms;
    const visiblePlatforms = gamePlatforms.slice(0, 2);
    const statusBadgeDynamic = {
      borderColor: activeStatus.color,
      backgroundColor: activeStatus.color + '20',
    };
    const statusTextDynamic = { color: activeStatus.color };
    const priorityBadgeDynamic = userGame.priority
      ? {
          borderColor: priorityConfig[userGame.priority].color + '40',
          backgroundColor: priorityConfig[userGame.priority].color + '20',
        }
      : undefined;
    const priorityTextDynamic = userGame.priority
      ? { color: priorityConfig[userGame.priority].color }
      : undefined;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleGamePress(userGame)}
        style={styles.gameCard}
      >
        <View style={styles.gameRow}>
          {userGame.game.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(userGame.game.coverUrl) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}

          <View style={styles.gameInfo}>
            <View style={styles.gameHeader}>
              <Text style={styles.gameTitle} numberOfLines={1}>
                {userGame.game.title}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleDelete(userGame.gameId, userGame.game.title)
                }
                style={styles.deleteButton}
              >
                <Icon name="delete-outline" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <Stars
              rating={userGame.rating ?? 0}
              onPress={r => handleRating(userGame.gameId, r)}
            />

            <View style={styles.platformsRow}>
              {visiblePlatforms.map(p => (
                <View key={p} style={styles.platformBadge}>
                  <Text style={styles.platformText}>{p}</Text>
                </View>
              ))}
              {gamePlatforms.length > 2 && (
                <Text style={styles.morePlatformsText}>
                  +{gamePlatforms.length - 2}
                </Text>
              )}
            </View>

            {editingHours === userGame.id ? (
              <View style={styles.hoursEditRow}>
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Horas"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={hoursInput}
                  onChangeText={setHoursInput}
                />
                <TouchableOpacity
                  onPress={() => handleSaveHours(userGame.gameId)}
                  style={styles.inlineOkButton}
                >
                  <Text style={styles.inlineOkText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditingHours(userGame.id);
                  setHoursInput(String(userGame.hoursPlayed ?? ''));
                }}
              >
                <Text style={styles.hoursText}>
                  {userGame.hoursPlayed !== null
                    ? `${userGame.hoursPlayed}h`
                    : '0h'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[styles.statusBadgeBase, statusBadgeDynamic]}
          >
            <Text
              style={[styles.statusLabelBase, statusTextDynamic]}
            >
              {activeStatus.label}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const idx = statuses.findIndex(s => s.key === userGame.status);
                const next = statuses[(idx + 1) % statuses.length].key;
                changeStatus(userGame.gameId, next);
              }}
            >
              <Text style={[styles.statusArrowBase, statusTextDynamic]}> ▼</Text>
            </TouchableOpacity>
          </View>

          {userGame.priority && (
            <View
              style={[styles.priorityBadgeBase, priorityBadgeDynamic]}
            >
              <Text
                style={[styles.priorityLabelBase, priorityTextDynamic]}
              >
                {priorityConfig[userGame.priority].label}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              const idx = priorityCycle.indexOf(userGame.priority);
              const next = priorityCycle[(idx + 1) % priorityCycle.length];
              updatePriority(userGame.gameId, next);
            }}
            style={styles.priorityButton}
          >
            <Text style={styles.priorityButtonText}>
              {userGame.priority
                ? priorityCycle.indexOf(userGame.priority) +
                  1 +
                  '/' +
                  (priorityCycle.length - 1)
                : '-'}
            </Text>
          </TouchableOpacity>

          {editingNotes === userGame.id ? (
            <View style={styles.notesEditRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Notas..."
                placeholderTextColor={colors.textTertiary}
                value={notesInput}
                onChangeText={setNotesInput}
              />
              <TouchableOpacity
                onPress={() => handleSaveNotes(userGame.gameId)}
                style={styles.inlineOkButton}
              >
                <Text style={styles.inlineOkText}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.notesButton}
              onPress={() => {
                setEditingNotes(userGame.id);
                setNotesInput(userGame.notes ?? '');
              }}
            >
              <Text style={styles.notesText} numberOfLines={1}>
                {userGame.notes || 'Notas...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, topPadding]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Biblioteca ({games.length}/{total})
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              const url = exportUrl({
                search: searchQuery || undefined,
                status: statusFilter ?? undefined,
                platform: platformFilter ?? undefined,
                genre: genreFilter ?? undefined,
                sort: sortKey,
              });
              Linking.openURL(url);
            }}
          >
            <Icon name="file-export-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Dashboard')}
          >
            <Icon name="account-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en biblioteca..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchLibrary(true)}
        />
        <TouchableOpacity
          onPress={() => fetchLibrary(true)}
          disabled={loading}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Sin conexión — mostrando datos guardados
          </Text>
        </View>
      )}

      {!isOffline && pendingMutationCount > 0 && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            {pendingMutationCount === 1
              ? '1 cambio pendiente de sincronizar'
              : `${pendingMutationCount} cambios pendientes de sincronizar`}
          </Text>
        </View>
      )}

      <View style={styles.filterSortRow}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[
            styles.filterChipBase,
            activeFilterCount > 0
              ? styles.filterChipActive
              : styles.filterChipInactive,
          ]}
        >
          <Text
            style={[
              styles.filterChipTextBase,
              activeFilterCount > 0
                ? styles.filterChipTextActive
                : styles.filterChipTextInactive,
            ]}
          >
            Filtrar
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {activeFilterCount}
              </Text>
            </View>
          )}
          <Text style={styles.filterArrow}>
            {showFilters ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {sortOptions.map(opt => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setSortKey(opt.key)}
            style={[
              styles.sortChipBase,
              sortKey === opt.key
                ? styles.sortChipActive
                : styles.sortChipInactive,
            ]}
          >
            <Text
              style={[
                styles.sortChipTextBase,
                sortKey === opt.key
                  ? styles.sortChipTextActive
                  : styles.sortChipTextInactive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showFilters && (
        <View style={styles.filterListContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              ...statuses.map(s => ({
                type: 'status' as const,
                key: s.key,
                label: s.label,
                color: s.color,
                active: statusFilter === s.key,
              })),
              ...platforms.map(p => ({
                type: 'platform' as const,
                key: p,
                label: p,
                color: hues.azure,
                active: platformFilter === p,
              })),
              ...genres.map(g => ({
                type: 'genre' as const,
                key: g,
                label: g,
                color: hues.purple,
                active: genreFilter === g,
              })),
            ]}
            keyExtractor={item => item.type + item.key}
            renderItem={({ item }) => {
              const chipDynamic = item.active
                ? {
                    borderColor: item.color,
                    backgroundColor: item.color + '25',
                  }
                : undefined;
              const textDynamic = item.active
                ? { color: item.color }
                : undefined;

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (item.type === 'status')
                      handleFilterChange(
                        setStatusFilter,
                        item.active ? null : (item.key as GameStatus),
                      );
                    else if (item.type === 'platform')
                      handleFilterChange(
                        setPlatformFilter,
                        item.active ? null : item.key,
                      );
                    else
                      handleFilterChange(
                        setGenreFilter,
                        item.active ? null : item.key,
                      );
                  }}
                  style={[styles.filterItemChipBase, chipDynamic]}
                >
                  <Text style={[styles.filterItemTextBase, textDynamic]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <FlatList
        data={games}
        keyExtractor={item => item.id}
        renderItem={renderGame}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchLibrary(true)}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.footerLoader}
            />
          ) : games.length > 0 && games.length >= total ? (
            <View style={styles.footerSpacer} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyListText}>
              No hay juegos con esos filtros
            </Text>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 22,
  },
  starActive: {
    color: colors.accent,
  },
  starInactive: {
    color: colors.textMuted,
  },
  loadingIndicator: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  gameCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xs,
    padding: 10,
    marginBottom: 10,
  },
  gameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coverImage: {
    width: 50,
    height: 68,
    borderRadius: radius.xs,
  },
  coverPlaceholder: {
    width: 50,
    height: 68,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xs,
  },
  gameInfo: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    paddingLeft: 6,
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  platformBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  platformText: {
    color: colors.textSecondary,
    fontSize: 9,
  },
  morePlatformsText: {
    color: colors.textTertiary,
    fontSize: 9,
    alignSelf: 'center',
  },
  hoursEditRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: colors.text,
    fontSize: 11,
  },
  inlineOkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  inlineOkText: {
    color: '#fff',
    fontSize: 11,
  },
  hoursText: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusBadgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  statusLabelBase: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusArrowBase: {
    fontSize: 9,
  },
  priorityBadgeBase: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  priorityLabelBase: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityButtonText: {
    color: colors.textTertiary,
    fontSize: 9,
  },
  notesEditRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  notesButton: {
    flex: 1,
  },
  notesText: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: radius.xs,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  offlineBanner: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.xs,
    padding: 8,
    marginBottom: 12,
  },
  offlineText: {
    color: colors.accent,
    fontSize: 12,
    textAlign: 'center',
  },
  filterSortRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterChipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterChipInactive: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  filterChipTextBase: {
    fontSize: 12,
  },
  filterChipTextActive: {
    color: colors.text,
  },
  filterChipTextInactive: {
    color: colors.textSecondary,
  },
  filterBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  filterArrow: {
    color: colors.textTertiary,
    fontSize: 10,
  },
  spacer: {
    flex: 1,
  },
  sortChipBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  sortChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  sortChipInactive: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  sortChipTextBase: {
    fontSize: 11,
  },
  sortChipTextActive: {
    color: colors.text,
  },
  sortChipTextInactive: {
    color: colors.textTertiary,
  },
  filterListContainer: {
    marginBottom: 12,
  },
  filterItemChipBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginRight: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  filterItemTextBase: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  footerLoader: {
    marginVertical: 16,
  },
  footerSpacer: {
    height: 32,
  },
  emptyListText: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 32,
  },
});
