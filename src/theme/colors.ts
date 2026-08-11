import { createAppTheme, brands, hues, semantic, hexToRgba } from './tokens';
import type { GameStatus } from '../types';

/**
 * VaultGaming es solo-oscuro por diseño (no hay toggle de tema hoy), así
 * que se exporta directo el lado `dark` del theme compartido en vez de un
 * ThemeContext completo como el de Varo. `primary`/`accent` vienen de
 * `brands.vaultgaming` en brand-kit/tokens.ts — ver README.md#colores-por-app.
 */
export const colors = createAppTheme(brands.vaultgaming).dark;

/**
 * Colores de estado de un juego en la biblioteca. Antes eran 5 hex sueltos
 * por bg/text (`#4c1d95`/`#d8b4fe`, etc.) inventados aparte del resto de la
 * paleta — y **ni siquiera eran consistentes entre sí**: `StatusBadge`
 * pintaba WISHLIST de morado y COMPLETED de esmeralda, mientras
 * `StatusSelectorModal` pintaba WISHLIST de ámbar y COMPLETED de violeta.
 * Un mismo juego "Deseado" se veía de dos colores distintos según la
 * pantalla. Se estandarizó al mapeo del selector (coincide con lo ya
 * documentado en CLAUDE.md) y ahora cada estado referencia un `hue`
 * canónico del brand-kit — ninguno es nuevo.
 */
export const statusColors: Record<GameStatus, { bg: string; text: string; label: string }> = {
  WISHLIST: { bg: hexToRgba(hues.amber, 0.18), text: semantic.warning.dark, label: 'Deseado' },
  OWNED: { bg: hexToRgba(hues.azure, 0.18), text: semantic.info.dark, label: 'Comprado' },
  PLAYING: { bg: hexToRgba(hues.green, 0.18), text: semantic.success.dark, label: 'Jugando' },
  COMPLETED: { bg: hexToRgba(hues.purple, 0.18), text: hues.purple, label: 'Completado' },
  DROPPED: { bg: hexToRgba(hues.red, 0.18), text: semantic.danger.dark, label: 'Abandonado' },
};

/** Mismo mapeo, sin el par bg/text "soft" — para dots/indicadores sólidos (ver StatusSelectorModal). */
export const statusDotColors: Record<GameStatus, string> = {
  WISHLIST: hues.amber,
  OWNED: hues.azure,
  PLAYING: hues.green,
  COMPLETED: hues.purple,
  DROPPED: hues.red,
};
