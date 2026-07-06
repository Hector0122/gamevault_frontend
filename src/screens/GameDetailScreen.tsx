import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, StyleSheet } from 'react-native';
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
    <ScrollView style={styles.container}>
      {game.coverUrl && !imgFailed ? (
        <Image
          source={{ uri: imageProxyUrl(game.coverUrl) }}
          style={[styles.coverImage, { width }]}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <View style={[styles.coverPlaceholder, { width }]}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {game.title}
          </Text>
          {isOwned && (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedBadgeText}>En colección ✓</Text>
            </View>
          )}
        </View>

        {releaseYear && (
          <Text style={styles.releaseYear}>
            Lanzamiento: {releaseYear}
          </Text>
        )}

        {game.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {game.genres.map((g) => (
              <View key={g} style={styles.genrePill}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {game.platforms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Plataformas</Text>
            <Text style={styles.sectionText}>{game.platforms.join(', ')}</Text>
          </View>
        )}

        {game.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sinopsis</Text>
            <Text style={styles.descriptionText}>{game.description}</Text>
          </View>
        ) : null}

        {(game.timeToBeatHastly || game.timeToBeatNormally || game.timeToBeatCompletely) ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Duración estimada</Text>
            {game.timeToBeatHastly && (
              <Text style={styles.durationText}>Rápido: {fmtMinutes(game.timeToBeatHastly)}</Text>
            )}
            {game.timeToBeatNormally && (
              <Text style={styles.durationText}>Normal: {fmtMinutes(game.timeToBeatNormally)}</Text>
            )}
            {game.timeToBeatCompletely && (
              <Text style={styles.durationText}>Completista: {fmtMinutes(game.timeToBeatCompletely)}</Text>
            )}
          </View>
        ) : null}

        {userGame && (
          <>
            <Text style={styles.sectionLabel}>Calificación</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setRating(i === rating ? 0 : i)}>
                  <Text style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Horas jugadas</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={hoursInput}
              onChangeText={setHoursInput}
            />

            <Text style={styles.sectionLabel}>Notas</Text>
            <TextInput
              style={styles.inputMultiline}
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
            <Text style={styles.sectionLabel}>Fechas</Text>
            <Text style={styles.datesText}>
              {userGame.startedAt ? `Iniciado: ${fmtDate(userGame.startedAt)}` : ''}
              {userGame.startedAt && userGame.completedAt ? ' | ' : ''}
              {userGame.completedAt ? `Completado: ${fmtDate(userGame.completedAt)}` : ''}
              {!userGame.startedAt && !userGame.completedAt ? 'Sin registrar' : ''}
            </Text>
          </>
        )}

        <Text style={styles.statusLabel}>
          Estado
        </Text>
        <View style={styles.statusContainer}>
          {statuses.map((s) => {
            const active = selectedStatus === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSelectedStatus(s.key)}
                style={[styles.statusButtonBase, active ? styles.statusButtonActive : styles.statusButtonInactive]}
              >
                <Text style={active ? styles.statusTextActive : styles.statusTextInactive}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleAdd}
          disabled={saving}
          style={[styles.saveButtonBase, saving ? styles.saveButtonDisabled : styles.saveButtonActive]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : userGame ? 'Guardar cambios' : 'Agregar a colección'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  coverImage: {
    height: 300,
  },
  coverPlaceholder: {
    height: 300,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  ownedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  releaseYear: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  genrePill: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  descriptionText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  durationText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 16,
  },
  starFilled: {
    fontSize: 20,
    color: '#f59e0b',
  },
  starEmpty: {
    fontSize: 20,
    color: '#374151',
  },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  inputMultiline: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    minHeight: 60,
  },
  datesText: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 16,
  },
  statusLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statusButtonBase: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusButtonActive: {
    borderColor: '#059669',
    backgroundColor: '#065f46',
  },
  statusButtonInactive: {
    borderColor: '#374151',
    backgroundColor: 'transparent',
  },
  statusTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statusTextInactive: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  saveButtonBase: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#059669',
  },
  saveButtonDisabled: {
    backgroundColor: '#374151',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
