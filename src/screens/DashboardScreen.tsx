import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useDashboard } from '../hooks/useGames';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { semantic, radius } from '../theme/tokens';
import Button from '../components/Button';

const cards = [
  { key: 'total', label: 'Total' },
  { key: 'WISHLIST', label: 'Deseados' },
  { key: 'OWNED', label: 'Comprados' },
  { key: 'PLAYING', label: 'Jugando' },
  { key: 'COMPLETED', label: 'Completados' },
  { key: 'DROPPED', label: 'Abandonados' },
] as const;

export default function DashboardScreen() {
  const { logout } = useAuth();
  const { stats, loading, isOffline, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchStats}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Sin conexión — mostrando datos guardados
          </Text>
        </View>
      )}

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {cards.map(({ key, label }) => (
          <View key={key} style={styles.statCard}>
            <Text style={styles.statNumber}>{(stats as any)?.[key] ?? 0}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Backlog card */}
      {stats && (
        <View style={styles.backlogCard}>
          <View>
            <Text style={styles.backlogTitle}>Tiempo restante estimado</Text>
            <Text style={styles.backlogSubtitle}>
              Por jugar (pendientes + en curso)
            </Text>
          </View>
          <Text style={styles.backlogHours}>
            {stats.estimatedHoursRemaining}h
          </Text>
        </View>
      )}

      <View style={styles.logoutButton}>
        <Button title="Cerrar sesión" onPress={logout} variant="danger" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xs,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  backlogCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.xs,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backlogTitle: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  backlogSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  backlogHours: {
    fontSize: 24,
    fontWeight: 'bold',
    color: semantic.warning.dark,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});
