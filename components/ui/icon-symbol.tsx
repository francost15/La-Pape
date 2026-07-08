// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { IconSymbolProps } from "@/interface/ui/icons";
import { SF_SYMBOL_MAPPING } from "@/interface/ui/icons";

export type { IconSymbolName } from "@/interface/ui/icons";

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({ name, size = 24, color, style }: IconSymbolProps) {
  return <MaterialIcons color={color} size={size} name={SF_SYMBOL_MAPPING[name]} style={style} />;
}
