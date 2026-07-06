import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDeals } from '../hooks/useGames';
import { imageProxyUrl } from '../services/api';
import type { DealRecommendation, WishlistDeal } from '../types';

type Tab = 'recommendations' | 'wishlist';

export default function DealsScreen() {
  const insets = useSafeAreaInsets();
  const {
    recommendations,
    wishlistDeals,
    loading,
    error,
    message,
    fetchDeals,
  } = useDeals();
  const [tab, setTab] = useState<Tab>('recommendations');

  useFocusEffect(
    useCallback(() => {
      fetchDeals();
    }, [fetchDeals]),
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
        style={styles.card}
      >
        <View style={styles.cardRow}>
          {item.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(item.coverUrl) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>

            {item.genres.length > 0 && (
              <Text style={styles.genreText} numberOfLines={1}>
                {item.genres.join(', ')}
              </Text>
            )}

            {item.deal ? (
              <View style={styles.dealBadge}>
                <View style={styles.dealRow}>
                  <Text style={styles.discountText}>
                    🔥 {item.deal.discount}% OFF
                  </Text>
                  <Text style={styles.originalPrice}>
                    ${item.deal.regularPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.currentPrice}>
                    ${item.deal.currentPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.storeText}>en {item.deal.store}</Text>
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
        style={styles.card}
      >
        <View style={styles.cardRow}>
          {item.coverUrl ? (
            <Image
              source={{ uri: imageProxyUrl(item.coverUrl) }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.genres.length > 0 && (
              <Text style={styles.genreText} numberOfLines={1}>
                {item.genres.join(', ')}
              </Text>
            )}

            {item.currentPrice != null && item.regularPrice != null && (
              <View style={styles.dealBadge}>
                <View style={styles.dealRow}>
                  <Text style={styles.discountText}>
                    🔥 {item.discount}% OFF
                  </Text>
                  <Text style={styles.originalPrice}>
                    ${item.regularPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.currentPrice}>
                    ${item.currentPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.storeText}>en {item.store}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Ofertas</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('recommendations')}
          style={[
            styles.tabButton,
            tab === 'recommendations'
              ? styles.tabButtonActive
              : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={
              tab === 'recommendations'
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Recomendaciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('wishlist')}
          style={[
            styles.tabButton,
            tab === 'wishlist'
              ? styles.tabButtonActive
              : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={
              tab === 'wishlist' ? styles.tabTextActive : styles.tabTextInactive
            }
          >
            Deseados en oferta
          </Text>
          {wishlistDeals.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{wishlistDeals.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {tab === 'recommendations' && (
        <>
          {message && !loading && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          {loading && recommendations.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#10b981"
              style={styles.loadingContainer}
            />
          ) : recommendations.length === 0 && !message ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Completa juegos en tu biblioteca para recibir recomendaciones
                personalizadas.
              </Text>
              <TouchableOpacity
                onPress={fetchDeals}
                style={styles.updateButton}
              >
                <Text style={styles.updateButtonText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={item => item.title}
              renderItem={renderRecommendation}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={fetchDeals}
                  tintColor="#10b981"
                />
              }
              ListFooterComponent={<View style={styles.footer} />}
            />
          )}
        </>
      )}

      {tab === 'wishlist' && (
        <>
          {loading && wishlistDeals.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#10b981"
              style={styles.loadingContainer}
            />
          ) : wishlistDeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {message
                  ? 'Agrega juegos a tu lista de deseos para ver sus ofertas.'
                  : 'No hay ofertas para tus deseados en este momento.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={wishlistDeals}
              keyExtractor={item => item.title}
              renderItem={renderWishlistDeal}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={fetchDeals}
                  tintColor="#10b981"
                />
              }
              ListFooterComponent={<View style={styles.footer} />}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#065f46',
    borderColor: '#059669',
  },
  tabButtonInactive: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -4,
    right: -4,
  },
  badgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coverImage: {
    width: 50,
    height: 68,
    borderRadius: 4,
  },
  coverPlaceholder: {
    width: 50,
    height: 68,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  genreText: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  dealBadge: {
    backgroundColor: '#f59e0b20',
    borderWidth: 1,
    borderColor: '#f59e0b40',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  originalPrice: {
    color: '#6b7280',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700',
  },
  storeText: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
  },
  messageContainer: {
    backgroundColor: '#3b82f620',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    color: '#3b82f6',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    height: 32,
  },
});
