/**
 * Re-export the icon name type from the main (non-platform) icon-symbol.
 * This ensures consistent typings when platform-specific files (e.g. .ios.tsx)
 * use a different implementation with a different type.
 */
export type { IconSymbolName } from './icon-symbol';
