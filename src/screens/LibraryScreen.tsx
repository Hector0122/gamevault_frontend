import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibrary } from '../hooks/useGames';
import type { GameStatus } from '../types';
import { imageProxyUrl } from '../services/api';

const statuses: { key: GameStatus; label: string; color: string }[] = [
  { key: 'WISHLIST', label: 'Deseado', color: '#f59e0b' },
  { key: 'OWNED', label: 'Comprado', color: '#3b82f6' },
  { key: 'PLAYING', label: 'Jugando', color: '#10b981' },
  { key: 'COMPLETED', label: 'Completado', color: '#8b5cf6' },
  { key: 'DROPPED', label: 'Abandonado', color: '#ef4444' },
];

function Stars({ rating, onPress }: { rating: number; onPress?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onPress?.(i)} disabled={!onPress}>
          <Text style={{ fontSize: 16, color: i <= rating ? '#f59e0b' : '#374151' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { games, loading, fetchLibrary, changeStatus, updateHours, updateNotes, removeGame } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingHours, setEditingHours] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [])
  );

  const filtered = useMemo(
    () => games.filter((g) => g.game.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [games, searchQuery],
  );

  async function handleSaveHours(gameId: string) {
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours < 0) {
      Alert.alert('Error', 'Ingresa un número válido');
      return;
    }
    try {
      await updateHours(gameId, hours);
      setEditingHours(null);
      setHoursInput('');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar las horas');
    }
  }

  async function handleSaveNotes(gameId: string) {
    try {
      await updateNotes(gameId, { notes: notesInput || null });
      setEditingNotes(null);
      setNotesInput('');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar las notas');
    }
  }

  function handleRating(gameId: string, rating: number) {
    updateNotes(gameId, { rating });
  }

  function handleDelete(gameId: string, title: string) {
    Alert.alert('Eliminar juego', `¿Eliminar "${title}" de la biblioteca?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeGame(gameId) },
    ]);
  }

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
    <ScrollView style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Biblioteca ({games.length})
      </Text>

      <TextInput
        style={{
          backgroundColor: '#111827',
          borderWidth: 1,
          borderColor: '#374151',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: '#fff',
          fontSize: 14,
          marginBottom: 16,
        }}
        placeholder="Buscar en biblioteca..."
        placeholderTextColor="#6b7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filtered.map((userGame) => (
        <View
          key={userGame.id}
          style={{
            backgroundColor: '#111827',
            borderWidth: 1,
            borderColor: '#1f2937',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 }}>
                  {userGame.game.title}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(userGame.gameId, userGame.game.title)} style={{ paddingLeft: 8 }}>
                  <Text style={{ color: '#ef4444', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Stars rating={userGame.rating ?? 0} onPress={(r) => handleRating(userGame.gameId, r)} />

              {editingHours === userGame.id ? (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <TextInput
                    style={{
                      flex: 1, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, color: '#fff', fontSize: 12,
                    }}
                    placeholder="Horas"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    value={hoursInput}
                    onChangeText={setHoursInput}
                  />
                  <TouchableOpacity
                    onPress={() => handleSaveHours(userGame.gameId)}
                    style={{ backgroundColor: '#059669', paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setEditingHours(userGame.id); setHoursInput(String(userGame.hoursPlayed ?? '')); }}>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {userGame.hoursPlayed !== null ? `${userGame.hoursPlayed}h jugadas` : '0h — toca para editar'}
                  </Text>
                </TouchableOpacity>
              )}

              {editingNotes === userGame.id ? (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <TextInput
                    style={{
                      flex: 1, backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, color: '#fff', fontSize: 12,
                    }}
                    placeholder="Notas personales..."
                    placeholderTextColor="#6b7280"
                    value={notesInput}
                    onChangeText={setNotesInput}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={() => handleSaveNotes(userGame.gameId)}
                    style={{ backgroundColor: '#059669', paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setEditingNotes(userGame.id); setNotesInput(userGame.notes ?? ''); }}>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {userGame.notes ? userGame.notes : 'Sin notas — toca para añadir'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Status pills */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {statuses.map((s) => {
              const active = userGame.status === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => changeStatus(userGame.gameId, s.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: active ? s.color : '#374151',
                    backgroundColor: active ? s.color + '25' : 'transparent',
                  }}
                >
                  <Text style={{ color: active ? s.color : '#9ca3af', fontSize: 12, fontWeight: active ? '600' : '400' }}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
