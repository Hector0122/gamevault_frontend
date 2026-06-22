import { useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useDeals } from '../hooks/useGames';
import { imageProxyUrl } from '../services/api';
import type { DealRecommendation } from '../types';

export default function DealsScreen() {
  const insets = useSafeAreaInsets();
  const { recommendations, loading, error, message, fetchDeals } = useDeals();

  useFocusEffect(
    useCallback(() => {
      fetchDeals();
    }, [])
  );

  function renderItem({ item }: { item: DealRecommendation }) {
    return (
      <View
        style={{
          backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
          borderRadius: 8, padding: 12, marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {item.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(item.coverUrl) }}
              style={{ width: 50, height: 68, borderRadius: 4 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: 50, height: 68, backgroundColor: '#374151', borderRadius: 4 }} />
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', flex: 1 }}>
              {item.title}
            </Text>

            {item.genres.length > 0 && (
              <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                {item.genres.join(', ')}
              </Text>
            )}

            {item.inLibrary && (
              <View style={{ backgroundColor: '#10b98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 }}>
                <Text style={{ color: '#10b981', fontSize: 10 }}>En tu biblioteca ✓</Text>
              </View>
            )}

            {item.deal ? (
              <View style={{ backgroundColor: '#f59e0b20', borderWidth: 1, borderColor: '#f59e0b40', borderRadius: 6, padding: 8, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '600' }}>
                    🔥 {item.deal.discount}% OFF
                  </Text>
                  <Text style={{ color: '#6b7280', fontSize: 11, textDecorationLine: 'line-through' }}>
                    ${item.deal.regularPrice.toFixed(2)}
                  </Text>
                  <Text style={{ color: '#34d399', fontSize: 13, fontWeight: '700' }}>
                    ${item.deal.currentPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={{ color: '#9ca3af', fontSize: 10, marginTop: 2 }}>
                  en {item.deal.store}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Recomendaciones
      </Text>

      {loading && <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />}

      {error && (
        <View style={{ backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef4444', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ef4444', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {message && !loading && (
        <View style={{ backgroundColor: '#3b82f620', borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#3b82f6', fontSize: 13 }}>{message}</Text>
        </View>
      )}

      {!loading && recommendations.length === 0 && !message && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
            Completa juegos en tu biblioteca para recibir recomendaciones personalizadas.
          </Text>
          <TouchableOpacity
            onPress={fetchDeals}
            style={{ backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 }}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeals} tintColor="#10b981" />}
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </View>
  );
}