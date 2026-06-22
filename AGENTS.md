# GameVault — Frontend

Documentación unificada en: https://github.com/Hector0122/gamevault_server/blob/main/AGENTS.md

## Repo

https://github.com/Hector0122/gamevault_frontend

## Stack

- React Native 0.86 (bare workflow, Android focus)
- TypeScript
- @react-navigation/bottom-tabs + @react-navigation/native-stack
- react-native-safe-area-context
- react-native-fast-image
- react-native-mmkv (persistencia local)
- **react-native-toast-message** (toast notifications)
- Pnpm

---

## Desarrollo rápido

```bash
pnpm install
npx react-native run-android
```

---

## Estructura

```
src/
  types/        # Interfaces (Game, UserGame, DealRecommendation, DashboardStats, etc.)
  services/     # api.ts — todas las llamadas al backend
  hooks/        # useSearch, useLibrary, useDashboard, useDeals
  components/   # GameCard, StatusBadge, StatusSelectorModal
  screens/      # DashboardScreen, SearchScreen, LibraryScreen,
                # GameDetailScreen, DealsScreen, LoginScreen, RegisterScreen
  navigation/   # AppNavigator (tabs + LibraryStack + SearchStack)
  context/      # AuthContext (MMKV + JWT)
```

---

## Pantallas

### Biblioteca (`LibraryScreen`)
- Paginación server-side con FlatList (`onEndReached`)
- Filtros: búsqueda por texto, status, plataforma, género
- Ordenamiento: Reciente, A-Z, Horas, Rating
- Cards compactas: cover pequeño, rating estrellas, plataformas limitadas (2 + +N), badge de status único con cambio rápido
- Edición inline: horas jugadas, notas personales
- Cards tappables → navega a `GameDetailScreen` con datos editables
- Pull-to-refresh
- Header con contador, botón exportar 📥, botón perfil 👤

### Búsqueda (`SearchScreen`)
- Grid 3 columnas con `FlatList` `numColumns={3}`
- Paginación infinita (`onEndReached`)
- **Botón rápido agregar (+)** en cada card no poseída → abre `StatusSelectorModal`
- Cards poseídas muestran badge ✓

### Detalle del Juego (`GameDetailScreen`)
- Usado desde **biblioteca** (con datos editables) y desde **búsqueda** (agregar nuevo)
- Cover full-width, título, año, géneros, plataformas, sinopsis, duración estimada
- **Desde biblioteca**: muestra y permite editar rating ★, horas jugadas, notas personales, fechas de inicio/completado
- Selector de estado (5 opciones)
- Botón: "Agregar a colección" o "Guardar cambios"

### Ofertas (`DealsScreen`)
- Nueva pestaña 🏷️ en el bottom tab
- Recomendaciones AI personalizadas basadas en juegos **COMPLETED**
- Cada card: cover, título, géneros, badge de oferta 🔥 con % descuento, precio tachado, precio actual, tienda
- Cards tappables → abre URL directa de la tienda (Steam, GOG, etc.)
- Pull-to-refresh
- Estados: loading, error, message (si no hay juegos completados)

### Dashboard (`DashboardScreen`)
- Estadísticas: total de juegos, conteo por estado, horas restantes estimadas
- Pull-to-refresh
- Botón cerrar sesión

---

## Navegación

```
RootStack (NativeStack)
  ├── MainTabs (BottomTab)
  │     ├── Biblioteca → LibraryStack (NativeStack)
  │     │     ├── LibraryList → LibraryScreen
  │     │     └── GameDetail → GameDetailScreen
  │     ├── Buscar → SearchStack (NativeStack)
  │     │     ├── SearchList → SearchScreen
  │     │     └── GameDetail → GameDetailScreen
  │     └── Ofertas → DealsScreen
  └── Dashboard → DashboardScreen
```

---

## Hooks

### useSearch
- `search(query)` — búsqueda nueva, offset=0
- `loadMore()` — siguiente página usando `results.length` como offset
- `results`, `loading`, `loadingMore`, `error`, `ownedIds`

### useLibrary
- Estado: `games`, `total`, `loading`, `loadingMore`, `isOffline`
- Estado de filtros: `searchQuery`, `statusFilter`, `platformFilter`, `genreFilter`, `sortKey`
- `fetchLibrary(reset=true)` — carga página 1 o siguiente (usa `useRef` para page tracking)
- `loadMore()` — infinite scroll
- Mutaciones: `addToCollection`, `changeStatus`, `updateStatus`, `updateHours`, `updateNotes`, `removeGame`
- Cache en MMKV para offline

### useDeals
- `fetchDeals()` — carga recomendaciones + ofertas
- `recommendations`, `loading`, `error`, `message`

### useDashboard
- `fetchStats()` — carga estadísticas
- `stats`, `loading`, `isOffline`
- Cache en MMKV

---

## Componentes

### GameCard
- Props: `game`, `cardWidth`, `onPress`, `owned`, `onQuickAdd`
- Renderiza cover (aspect 1:1.5), badge ✓ si owned, botón + si no owned y `onQuickAdd` definido
- Usado en SearchScreen grid

### StatusSelectorModal
- Modal flotante con los 5 estados (WISHLIST, OWNED, PLAYING, COMPLETED, DROPPED)
- Colores por estado
- Se muestra al tocar el botón + rápido en search results

### StatusBadge
- Pill con color por estado. Usado en algunas vistas.

---

## Servicios (`api.ts`)

| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `searchGames(q, offset)` | GET `/search` | Buscar en IGDB |
| `getLibrary(params)` | GET `/games` | Biblioteca con filtros/paginación |
| `addGame(externalId)` | POST `/games` | Agregar a colección |
| `updateStatus(id, status)` | PATCH `/games/:id/status` | Cambiar estado |
| `updateNotes(id, data)` | PATCH `/games/:id/notes` | Rating + notas |
| `updateHours(id, hours)` | PATCH `/games/:id/hours` | Horas jugadas |
| `removeGame(id)` | DELETE `/games/:id` | Eliminar |
| `getDashboard()` | GET `/dashboard` | Estadísticas |
| `getDeals()` | GET `/deals` | Recomendaciones + ofertas |
| `exportUrl(params)` | GET `/export` | URL de descarga Excel |
| `imageProxyUrl(url)` | GET `/image-proxy` | URL de proxy de imagen |

---

## Notificaciones

Usamos **react-native-toast-message** en vez de `Alert.alert` para feedback no-crítico:
- Toast verde para éxito (2 segundos)
- Toast rojo para errores (2-3 segundos)
- `Alert.alert` se conserva solo para confirmación de eliminación

Configurado en `App.tsx` con `<Toast />` al final del árbol.

---

## Persistencia Local

**MMKV** (`react-native-mmkv`):
- Storage ID: `gamevault_cache`
- Cache de biblioteca (`CACHE_LIBRARY`)
- Cache de dashboard (`CACHE_DASHBOARD`)
- Token JWT y datos de usuario en `AuthContext` (storage ID: `gamevault`)

---

## Temas / Estilos

Esquema de colores dark:
- Background: `#030712`
- Cards: `#111827`
- Borders: `#1f2937` / `#374151`
- Accent: `#059669` / `#34d399` (verde/esmeralda)
- Text: `#fff` / `#9ca3af` / `#6b7280`
- Status colors:
  - WISHLIST: `#f59e0b` (amber)
  - OWNED: `#3b82f6` (blue)
  - PLAYING: `#10b981` (green)
  - COMPLETED: `#8b5cf6` (purple)
  - DROPPED: `#ef4444` (red)

---

## Tips para Agentes

- **Paginación**: El hook `useLibrary` usa `nextPageRef` (useRef) en vez de state para evitar problemas de closure staleness en `loadMore`.
- **Auth query param**: El endpoint `/export` usa `?token=` en la URL porque `Linking.openURL` no puede enviar headers. El backend acepta auth via header Bearer o query param token.
- **Images**: Todas las imágenes pasan por `imageProxyUrl()` porque Android Fresco no carga CloudFront directo.
- **TypeScript**: Ambos proyectos usan `tsc --noEmit` para verificación. No hay tests unitarios configurados.
- **API base**: Producción apunta a `https://gamevaultserver-production.up.railway.app/api`