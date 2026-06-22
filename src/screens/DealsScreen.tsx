import { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useDeals } from '../hooks/useGames';
import { imageProxyUrl } from '../services/api';
import type { DealRecommendation, WishlistDeal } from '../types';

type Tab = 'recommendations' | 'wishlist';

export default function DealsScreen() {
  const insets = useSafeAreaInsets();
  const { recommendations, wishlistDeals, loading, error, message, fetchDeals } = useDeals();
  const [tab, setTab] = useState<Tab>('recommendations');

  useFocusEffect(
    useCallback(() => {
      fetchDeals();
    }, [])
  );

  function renderRecommendation({ item }: { item: DealRecommendation }) {
    const canOpen = item.deal?.url != null;
    return (
      <TouchableOpacity
        activeOpacity={canOpen ? 0.6 : 1}
        disabled={!canOpen}
        onPress={() => {
          if (item.deal?.url) {
            Linking.openURL(item.deal.url);
          }
        }}
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
      </TouchableOpacity>
    );
  }

  function renderWishlistDeal({ item }: { item: WishlistDeal }) {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => Linking.openURL(item.url)}
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

            <View style={{ backgroundColor: '#f59e0b20', borderWidth: 1, borderColor: '#f59e0b40', borderRadius: 6, padding: 8, marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '600' }}>
                  🔥 {item.discount}% OFF
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 11, textDecorationLine: 'line-through' }}>
                  ${item.regularPrice.toFixed(2)}
                </Text>
                <Text style={{ color: '#34d399', fontSize: 13, fontWeight: '700' }}>
                  ${item.currentPrice.toFixed(2)}
                </Text>
              </View>
              <Text style={{ color: '#9ca3af', fontSize: 10, marginTop: 2 }}>
                en {item.store}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Ofertas
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setTab('recommendations')}
          style={{
            flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
            backgroundColor: tab === 'recommendations' ? '#065f46' : '#1f2937',
            borderWidth: 1, borderColor: tab === 'recommendations' ? '#059669' : '#374151',
          }}
        >
          <Text style={{ color: tab === 'recommendations' ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '600' }}>
            Recomendaciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('wishlist')}
          style={{
            flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
            backgroundColor: tab === 'wishlist' ? '#065f46' : '#1f2937',
            borderWidth: 1, borderColor: tab === 'wishlist' ? '#059669' : '#374151',
          }}
        >
          <Text style={{ color: tab === 'wishlist' ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '600' }}>
            Deseados en oferta
          </Text>
          {wishlistDeals.length > 0 && (
            <View style={{ backgroundColor: '#f59e0b', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -4, right: -4 }}>
              <Text style={{ color: '#000', fontSize: 9, fontWeight: '700' }}>{wishlistDeals.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef4444', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#ef4444', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {tab === 'recommendations' && (
        <>
          {message && !loading && (
            <View style={{ backgroundColor: '#3b82f620', borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: '#3b82f6', fontSize: 13 }}>{message}</Text>
            </View>
          )}

          {loading && recommendations.length === 0 ? (
            <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />
          ) : recommendations.length === 0 && !message ? (
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
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.title}
              renderItem={renderRecommendation}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeals} tintColor="#10b981" />}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          )}
        </>
      )}

      {tab === 'wishlist' && (
        <>
          {loading && wishlistDeals.length === 0 ? (
            <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />
          ) : wishlistDeals.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
                {message ? 'Agrega juegos a tu lista de deseos para ver sus ofertas.' : 'No hay ofertas para tus deseados en este momento.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={wishlistDeals}
              keyExtractor={(item) => item.title}
              renderItem={renderWishlistDeal}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeals} tintColor="#10b981" />}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          )}
        </>
      )}
    </View>
  );
}