import { Platform } from 'react-native';

/**
 * Digital Atelier — Typography System
 *
 * Jerarquía:
 * - `display`: KPIs, precios grandes, titulares con impacto — Space Grotesk Bold
 * - `heading`: subtítulos, encabezados de sección — Space Grotesk SemiBold
 * - `body`: texto de lectura, descripciones — Inter Regular
 * - `bodyStrong`: botones, labels, énfasis — Inter Medium/SemiBold
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
    display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    heading: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
    bodyStrong: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  default: {
    display: 'sans-serif',
    heading: 'sans-serif',
    body: 'sans-serif',
    bodyStrong: 'sans-serif',
  },
});
