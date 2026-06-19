# GameVault — Frontend Android

App Android nativa para gestionar colección de videojuegos.

## Stack

- React Native 0.86 (bare workflow, Android focus)
- TypeScript
- @react-navigation/bottom-tabs + native-stack
- Pnpm

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

- [x] Búsqueda de juegos desde IGDB
- [x] Biblioteca con cambio de estados
- [x] Dashboard con estadísticas
- [x] Pantalla de detalle con selector de estado
- [!] Imágenes IGDB no cargan en Android (pendiente)
- [ ] iOS (no prioritario)
- [ ] Notas y calificaciones
- [ ] Seguimiento de horas
