/**
 * Digital Atelier — Theme Colors
 *
 * Navy-based dark mode for premium feel.
 * Stone-based light mode for warmth.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FAFAF9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    tint: '#EA580C',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#EA580C',
    border: 'rgba(0,0,0,0.06)',
    borderStrong: 'rgba(0,0,0,0.12)',
  },
  dark: {
    text: '#F0F0F0',
    background: '#0C0F14',
    surface: '#141820',
    surfaceElevated: '#1A1F2B',
    tint: '#F97316',
    icon: '#8B95A5',
    tabIconDefault: '#5A6478',
    tabIconSelected: '#F97316',
    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.12)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', 'Space Grotesk', system-ui, -apple-system, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
