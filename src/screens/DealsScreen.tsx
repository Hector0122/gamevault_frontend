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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDeals } from '../hooks/useGames';
import { imageProxyUrl } from '../services/api';
import { colors } from '../theme/colors';
import { hexToRgba, radius } from '../theme/tokens';
import Button from '../components/Button';
import type { DealRecommendation, WishlistDeal } from '../types';

type Tab = 'recommendations' | 'wishlist';

export default function DealsScreen() {
  const insets = useSafeAreaInsets();
  const {
    recommendations,
    wishlistDeals,
    loading,
    generating,
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
                  <Icon name="fire" size={13} color={colors.accent} />
                  <Text style={styles.discountText}>
                    {item.deal.discount}% OFF
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
                  <Icon name="fire" size={13} color={colors.accent} />
                  <Text style={styles.discountText}>
                    {item.discount}% OFF
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
          {message && !loading && !generating && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          {(loading || generating) && recommendations.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              {generating && (
                <Text style={styles.generatingText}>
                  Generando recomendaciones personalizadas… esto puede tardar
                  unos segundos.
                </Text>
              )}
            </View>
          ) : recommendations.length === 0 && !message ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Completa juegos en tu biblioteca para recibir recomendaciones
                personalizadas.
              </Text>
              <View style={styles.updateButton}>
                <Button title="Actualizar" onPress={fetchDeals} />
              </View>
            </View>
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={item => item.title}
              renderItem={renderRecommendation}
              refreshControl={
                <RefreshControl
                  refreshing={loading || generating}
                  onRefresh={fetchDeals}
                  tintColor={colors.primary}
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
              color={colors.primary}
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
                  tintColor={colors.primary}
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
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
    borderRadius: radius.xs,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabButtonInactive: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  tabTextActive: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.xs,
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
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.xs,
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
    borderRadius: radius.xs,
  },
  coverPlaceholder: {
    width: 50,
    height: 68,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xs,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  genreText: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  dealBadge: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.xs,
    padding: 8,
    marginTop: 6,
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  originalPrice: {
    color: colors.textTertiary,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  storeText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: hexToRgba(colors.danger, 0.15),
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.xs,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  messageContainer: {
    backgroundColor: hexToRgba(colors.info, 0.15),
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: radius.xs,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    color: colors.info,
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  generatingText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
  },
  updateButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  footer: {
    height: 32,
  },
});
