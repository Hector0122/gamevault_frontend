import { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  const { stats, loading, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#030712', paddingTop: 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Dashboard
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {cards.map(({ key, label }) => (
          <View
            key={key}
            style={{
              width: '47%',
              backgroundColor: '#111827',
              borderWidth: 1,
              borderColor: '#1f2937',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#34d399' }}>
              {stats?.[key] ?? 0}
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{label}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 8,
          alignItems: 'center', marginTop: 24, marginBottom: 40,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
