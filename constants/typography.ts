import { Platform } from 'react-native';

/**
 * Jerarquía tipográfica centralizada.
 * - `display`: titulares con personalidad
 * - `heading`: subtítulos y encabezados de sección
 * - `body`: texto de lectura normal
 * - `bodyStrong`: botones/labels destacados
 */
export const AppFonts = Platform.select({
  ios: {
    display: 'AvenirNextCondensed-Heavy',
    heading: 'AvenirNext-DemiBold',
    body: 'AvenirNext-Regular',
    bodyStrong: 'AvenirNext-Medium',
  },
  android: {
    display: 'sans-serif-condensed',
    heading: 'sans-serif-medium',
    body: 'sans-serif',
    bodyStrong: 'sans-serif-medium',
  },
  web: {
    display: "'Bebas Neue', 'Oswald', 'Arial Narrow', sans-serif",
    heading: "'Nunito Sans', 'Avenir Next', 'Segoe UI', sans-serif",
    body: "'Nunito Sans', 'Segoe UI', sans-serif",
    bodyStrong: "'Nunito Sans', 'Avenir Next Demi Bold', sans-serif",
  },
  default: {
    display: 'sans-serif',
    heading: 'sans-serif',
    body: 'sans-serif',
    bodyStrong: 'sans-serif',
  },
});
