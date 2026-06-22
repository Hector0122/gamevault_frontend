import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Image, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useLibrary } from '../hooks/useGames';
import type { GameStatus, Priority, UserGame } from '../types';
import { imageProxyUrl, exportUrl } from '../services/api';
import type { LibraryStackParamList } from '../navigation/AppNavigator';

type LibraryNav = NativeStackNavigationProp<LibraryStackParamList, 'LibraryList'>;

const statuses: { key: GameStatus; label: string; color: string }[] = [
  { key: 'WISHLIST', label: 'Deseado', color: '#f59e0b' },
  { key: 'OWNED', label: 'Comprado', color: '#3b82f6' },
  { key: 'PLAYING', label: 'Jugando', color: '#10b981' },
  { key: 'COMPLETED', label: 'Completado', color: '#8b5cf6' },
  { key: 'DROPPED', label: 'Abandonado', color: '#ef4444' },
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
  HIGH: { label: '!!', color: '#ef4444' },
  MEDIUM: { label: '!', color: '#f59e0b' },
  LOW: { label: '↓', color: '#6b7280' },
};

function Stars({ rating, onPress }: { rating: number; onPress?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onPress?.(i)} disabled={!onPress} style={{ padding: 4 }}>
          <Text style={{ fontSize: 22, color: i <= rating ? '#f59e0b' : '#374151' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<LibraryNav>();
  const {
    games, total, loading, loadingMore, isOffline,
    fetchLibrary, loadMore,
    changeStatus, updateHours, updateNotes, removeGame, updatePriority,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    platformFilter, setPlatformFilter,
    genreFilter, setGenreFilter,
    sortKey, setSortKey,
  } = useLibrary();

  const [showFilters, setShowFilters] = useState(false);
  const [editingHours, setEditingHours] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchLibrary(true);
    }, [fetchLibrary])
  );

  const platforms = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => g.game.platforms.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [games]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => g.game.genres.forEach((gn) => set.add(gn)));
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
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa un número válido', position: 'bottom', visibilityTime: 2000 });
      return;
    }
    try {
      await updateHours(gameId, hours);
      setEditingHours(null);
      setHoursInput('');
      Toast.show({ type: 'success', text1: 'Horas guardadas', position: 'bottom', visibilityTime: 2000 });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron guardar las horas', position: 'bottom', visibilityTime: 2000 });
    }
  }

  async function handleSaveNotes(gameId: string) {
    try {
      await updateNotes(gameId, { notes: notesInput || null });
      setEditingNotes(null);
      setNotesInput('');
      Toast.show({ type: 'success', text1: 'Notas guardadas', position: 'bottom', visibilityTime: 2000 });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron guardar las notas', position: 'bottom', visibilityTime: 2000 });
    }
  }

  async function handleRating(gameId: string, rating: number) {
    await updateNotes(gameId, { rating }, true);
  }

  function handleDelete(gameId: string, title: string) {
    Alert.alert('Eliminar juego', `¿Eliminar "${title}" de la biblioteca?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeGame(gameId) },
    ]);
  }

  function handleGamePress(userGame: UserGame) {
    navigation.navigate('GameDetail', { game: userGame.game, userGame });
  }

  if (loading && games.length === 0) {
    return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1, backgroundColor: '#030712' }} />;
  }

  if (!loading && games.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center', paddingTop: insets.top + 16 }}>
        <Text style={{ color: '#9ca3af', fontSize: 16, textAlign: 'center', paddingHorizontal: 32 }}>
          Aún no tienes juegos. Busca y agrega desde la sección Buscar.
        </Text>
      </View>
    );
  }

  function renderGame({ item: userGame }: { item: UserGame }) {
    const activeStatus = statuses.find(s => s.key === userGame.status)!;
    const platforms = userGame.game.platforms;
    const visiblePlatforms = platforms.slice(0, 2);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleGamePress(userGame)}
        style={{
          backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
          borderRadius: 8, padding: 10, marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {userGame.game.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(userGame.game.coverUrl) }}
              style={{ width: 50, height: 68, borderRadius: 4 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: 50, height: 68, backgroundColor: '#374151', borderRadius: 4 }} />
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', flex: 1 }} numberOfLines={1}>
                {userGame.game.title}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(userGame.gameId, userGame.game.title)} style={{ paddingLeft: 6 }}>
                <Text style={{ color: '#ef4444', fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Stars rating={userGame.rating ?? 0} onPress={(r) => handleRating(userGame.gameId, r)} />

            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
              {visiblePlatforms.map(p => (
                <View key={p} style={{ backgroundColor: '#374151', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 9 }}>{p}</Text>
                </View>
              ))}
              {platforms.length > 2 && (
                <Text style={{ color: '#6b7280', fontSize: 9, alignSelf: 'center' }}>+{platforms.length - 2}</Text>
              )}
            </View>

            {editingHours === userGame.id ? (
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                <TextInput
                  style={{
                    flex: 1, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, color: '#fff', fontSize: 11,
                  }}
                  placeholder="Horas"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={hoursInput}
                  onChangeText={setHoursInput}
                />
                <TouchableOpacity
                  onPress={() => handleSaveHours(userGame.gameId)}
                  style={{ backgroundColor: '#059669', paddingHorizontal: 8, borderRadius: 4, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 11 }}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setEditingHours(userGame.id); setHoursInput(String(userGame.hoursPlayed ?? '')); }}>
                <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
                  {userGame.hoursPlayed !== null ? `${userGame.hoursPlayed}h` : '0h'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
            borderWidth: 1, borderColor: activeStatus.color,
            backgroundColor: activeStatus.color + '20',
          }}>
            <Text style={{ color: activeStatus.color, fontSize: 11, fontWeight: '600' }}>{activeStatus.label}</Text>
            <TouchableOpacity onPress={() => {
              const idx = statuses.findIndex(s => s.key === userGame.status);
              const next = statuses[(idx + 1) % statuses.length].key;
              changeStatus(userGame.gameId, next);
            }}>
              <Text style={{ color: activeStatus.color, fontSize: 9 }}> ▼</Text>
            </TouchableOpacity>
          </View>

          {userGame.priority && (
            <View style={{
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
              backgroundColor: priorityConfig[userGame.priority].color + '20',
              borderWidth: 1, borderColor: priorityConfig[userGame.priority].color + '40',
            }}>
              <Text style={{ color: priorityConfig[userGame.priority].color, fontSize: 10, fontWeight: '700' }}>
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
            style={{
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
              borderWidth: 1, borderColor: '#374151',
            }}
          >
            <Text style={{ color: '#6b7280', fontSize: 9 }}>
              {userGame.priority ? (priorityCycle.indexOf(userGame.priority) + 1) + '/' + (priorityCycle.length - 1) : '-'}
            </Text>
          </TouchableOpacity>

          {editingNotes === userGame.id ? (
            <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
              <TextInput
                style={{
                  flex: 1, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                  borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, color: '#fff', fontSize: 11,
                }}
                placeholder="Notas..."
                placeholderTextColor="#6b7280"
                value={notesInput}
                onChangeText={setNotesInput}
              />
              <TouchableOpacity
                onPress={() => handleSaveNotes(userGame.gameId)}
                style={{ backgroundColor: '#059669', paddingHorizontal: 8, borderRadius: 4, justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 11 }}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { setEditingNotes(userGame.id); setNotesInput(userGame.notes ?? ''); }}>
              <Text style={{ color: '#6b7280', fontSize: 11 }} numberOfLines={1}>
                {userGame.notes || 'Notas...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
          Biblioteca ({games.length}/{total})
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
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
            <Text style={{ color: '#34d399', fontSize: 18 }}>📥</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
            <Text style={{ color: '#34d399', fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={{
          backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 8,
          paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 14, marginBottom: 12,
        }}
        placeholder="Buscar en biblioteca..."
        placeholderTextColor="#6b7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => fetchLibrary(true)}
      />

      {isOffline && (
        <View style={{ backgroundColor: '#f59e0b20', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 8, padding: 8, marginBottom: 12 }}>
          <Text style={{ color: '#f59e0b', fontSize: 12, textAlign: 'center' }}>
            Sin conexión — mostrando datos guardados
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
            borderWidth: 1, borderColor: activeFilterCount > 0 ? '#34d399' : '#374151',
            backgroundColor: activeFilterCount > 0 ? '#065f46' : 'transparent',
          }}
        >
          <Text style={{ color: activeFilterCount > 0 ? '#fff' : '#9ca3af', fontSize: 12 }}>
            Filtrar
          </Text>
          {activeFilterCount > 0 && (
            <View style={{ backgroundColor: '#34d399', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>{activeFilterCount}</Text>
            </View>
          )}
          <Text style={{ color: '#6b7280', fontSize: 10 }}>{showFilters ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {sortOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setSortKey(opt.key)}
            style={{
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
              borderWidth: 1, borderColor: sortKey === opt.key ? '#34d399' : '#374151',
              backgroundColor: sortKey === opt.key ? '#065f46' : 'transparent',
            }}
          >
            <Text style={{ color: sortKey === opt.key ? '#fff' : '#6b7280', fontSize: 11 }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showFilters && (
        <View style={{ marginBottom: 12 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              ...statuses.map(s => ({ type: 'status' as const, key: s.key, label: s.label, color: s.color, active: statusFilter === s.key })),
              ...platforms.map(p => ({ type: 'platform' as const, key: p, label: p, color: '#3b82f6', active: platformFilter === p })),
              ...genres.map(g => ({ type: 'genre' as const, key: g, label: g, color: '#8b5cf6', active: genreFilter === g })),
            ]}
            keyExtractor={(item) => item.type + item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.type === 'status') handleFilterChange(setStatusFilter, item.active ? null : item.key as GameStatus);
                  else if (item.type === 'platform') handleFilterChange(setPlatformFilter, item.active ? null : item.key);
                  else handleFilterChange(setGenreFilter, item.active ? null : item.key);
                }}
                style={{
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 4,
                  borderWidth: 1, borderColor: item.active ? item.color : '#374151',
                  backgroundColor: item.active ? item.color + '25' : 'transparent',
                }}
              >
                <Text style={{ color: item.active ? item.color : '#6b7280', fontSize: 11 }}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGame}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchLibrary(true)} tintColor="#10b981" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#10b981" style={{ marginVertical: 16 }} />
          ) : games.length > 0 && games.length >= total ? (
            <View style={{ height: 32 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 20 }}>
              No hay juegos con esos filtros
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}