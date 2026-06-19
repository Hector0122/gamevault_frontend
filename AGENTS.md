# GameVault — Frontend Android

App Android nativa para gestionar colección de videojuegos.

## Stack

- React Native 0.86 (bare workflow, Android focus)
- TypeScript
- @react-navigation/bottom-tabs + native-stack
- Pnpm
- react-native-safe-area-context

## Repo

https://github.com/Hector0122/gamevault_frontend

## Estructura

```
src/
  types/        # Interfaces compartidas (Game, UserGame, etc.)
  services/     # API calls al backend
  hooks/        # Custom hooks (useSearch, useLibrary, useDashboard)
  components/   # GameCard, StatusBadge
  screens/      # DashboardScreen, SearchScreen, LibraryScreen, GameDetailScreen
  navigation/   # AppNavigator (tabs + stack)
```

## Desarrollo

```bash
pnpm install
npx react-native run-android
```

Requiere Android Studio + SDK. La API apunta a:
- Dev: `10.0.2.2:3001` (emulador) / `localhost:3001` (USB)
- Prod: `https://gamevaultserver-production.up.railway.app/api`

## Estado

- [x] Búsqueda de juegos desde IGDB con paginación (20 por página, scroll infinito)
- [x] Grid de 3 columnas en resultados de búsqueda
- [x] Imágenes IGDB vía proxy del backend (resuelto: Fresco no soportaba el CDN directo)
- [x] Biblioteca con cambio de estados y horas jugadas (edición inline)
- [x] Dashboard con estadísticas
- [x] Pantalla de detalle con selector de estado + duración estimada desde IGDB
- [x] Safe area insets para notch/barra de estado
- [ ] Notas y calificaciones
- [ ] Colecciones por plataforma/género

## Decisiones de Arquitectura

- Imágenes IGDB se sirven vía proxy en el backend (`/api/image-proxy`) porque React Native/Fresco en Android no cargaba URLs directas del CDN de IGDB (CloudFront). El proxy fetchea la imagen y la retorna con Content-Type correcto.
- Duración de juego desde endpoint separado de IGDB: `game_time_to_beats` (no viene incluido en `games`), se consulta en batch tras la búsqueda y se mergea con los resultados.
