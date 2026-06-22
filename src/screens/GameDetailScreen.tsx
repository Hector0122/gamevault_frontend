import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, TextInput } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState, useMemo } from 'react';
import Toast from 'react-native-toast-message';
import { useLibrary } from '../hooks/useGames';
import type { GameStatus } from '../types';
import type { SearchStackParamList, LibraryStackParamList } from '../navigation/AppNavigator';
import { imageProxyUrl } from '../services/api';

const statuses: { key: GameStatus; label: string }[] = [
  { key: 'WISHLIST', label: 'Deseado' },
  { key: 'OWNED', label: 'Comprado' },
  { key: 'PLAYING', label: 'Jugando' },
  { key: 'COMPLETED', label: 'Completado' },
  { key: 'DROPPED', label: 'Abandonado' },
];

function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GameDetailScreen() {
  const route = useRoute<RouteProp<SearchStackParamList & LibraryStackParamList, 'GameDetail'>>();
  const navigation = useNavigation();
  const { game, ownedIds, userGame } = route.params;
  const { addToCollection, updateStatus, updateNotes, updateHours } = useLibrary();
  const { width } = useWindowDimensions();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>(userGame?.status ?? 'OWNED');
  const [imgFailed, setImgFailed] = useState(false);
  const [rating, setRating] = useState(userGame?.rating ?? 0);
  const [hoursInput, setHoursInput] = useState(String(userGame?.hoursPlayed ?? ''));
  const [notesInput, setNotesInput] = useState(userGame?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const isOwned = useMemo(
    () => !!(userGame || ownedIds?.includes(game.externalId)),
    [ownedIds, game.externalId, userGame],
  );

  async function handleAdd() {
    setSaving(true);
    try {
      if (userGame) {
        await updateStatus(userGame.gameId, selectedStatus);
        await updateNotes(userGame.gameId, { rating: rating || null, notes: notesInput || null });
        const hours = parseFloat(hoursInput);
        if (!isNaN(hours) && hours >= 0) {
          await updateHours(userGame.gameId, hours);
        }
        Toast.show({ type: 'success', text1: 'Actualizado', text2: `${game.title} actualizado correctamente`, position: 'bottom', visibilityTime: 2000 });
      } else {
        await addToCollection(game.externalId, selectedStatus);
        Toast.show({ type: 'success', text1: 'Agregado', text2: `${game.title} agregado como "${statuses.find(s => s.key === selectedStatus)?.label}"`, position: 'bottom', visibilityTime: 2000 });
      }
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar', position: 'bottom', visibilityTime: 2000 });
    } finally {
      setSaving(false);
    }
  }

  const releaseYear = game.releaseDate
    ? new Date(game.releaseDate).getFullYear()
    : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#030712' }}>
      {game.coverUrl && !imgFailed ? (
        <Image
          source={{ uri: imageProxyUrl(game.coverUrl) }}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1 }}>
            {game.title}
          </Text>
          {isOwned && (
            <View style={{ backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>En colección ✓</Text>
            </View>
          )}
        </View>

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

        {(game.timeToBeatHastly || game.timeToBeatNormally || game.timeToBeatCompletely) ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Duración estimada</Text>
            {game.timeToBeatHastly && (
              <Text style={{ color: '#d1d5db', fontSize: 13 }}>Rápido: {fmtMinutes(game.timeToBeatHastly)}</Text>
            )}
            {game.timeToBeatNormally && (
              <Text style={{ color: '#d1d5db', fontSize: 13 }}>Normal: {fmtMinutes(game.timeToBeatNormally)}</Text>
            )}
            {game.timeToBeatCompletely && (
              <Text style={{ color: '#d1d5db', fontSize: 13 }}>Completista: {fmtMinutes(game.timeToBeatCompletely)}</Text>
            )}
          </View>
        ) : null}

        {userGame && (
          <>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Calificación</Text>
            <View style={{ flexDirection: 'row', gap: 2, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setRating(i === rating ? 0 : i)}>
                  <Text style={{ fontSize: 20, color: i <= rating ? '#f59e0b' : '#374151' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Horas jugadas</Text>
            <TextInput
              style={{
                backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#fff', fontSize: 14,
                marginBottom: 16,
              }}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={hoursInput}
              onChangeText={setHoursInput}
            />

            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Notas</Text>
            <TextInput
              style={{
                backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#fff', fontSize: 14,
                marginBottom: 16, minHeight: 60,
              }}
              placeholder="Notas personales..."
              placeholderTextColor="#6b7280"
              value={notesInput}
              onChangeText={setNotesInput}
              multiline
            />
          </>
        )}

        {userGame && (
          <>
            <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Fechas</Text>
            <Text style={{ color: '#d1d5db', fontSize: 13, marginBottom: 16 }}>
              {userGame.startedAt ? `Iniciado: ${fmtDate(userGame.startedAt)}` : ''}
              {userGame.startedAt && userGame.completedAt ? ' | ' : ''}
              {userGame.completedAt ? `Completado: ${fmtDate(userGame.completedAt)}` : ''}
              {!userGame.startedAt && !userGame.completedAt ? 'Sin registrar' : ''}
            </Text>
          </>
        )}

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
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
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
          disabled={saving}
          style={{
            backgroundColor: saving ? '#374151' : '#059669',
            paddingVertical: 14, borderRadius: 8, alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {saving ? 'Guardando...' : userGame ? 'Guardar cambios' : 'Agregar a colección'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}