import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDashboard } from '../hooks/useGames';
import { useAuth } from '../context/AuthContext';

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
      <ActivityIndicator size="large" color="#10b981" style={styles.loading} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchStats}
          tintColor="#10b981"
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

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  offlineBanner: {
    backgroundColor: '#f59e0b20',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  offlineText: {
    color: '#f59e0b',
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
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34d399',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  backlogCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backlogTitle: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  backlogSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  backlogHours: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
