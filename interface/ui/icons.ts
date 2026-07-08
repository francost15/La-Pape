import type { SymbolWeight } from "expo-symbols";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

/**
 * Mapa SF Symbol → Material Icon. Fuente de verdad para IconSymbolName;
 * el componente icon-symbol importa este mapa en lugar de definir el tipo.
 */
export const SF_SYMBOL_MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "cart.fill": "shopping-cart",
  "bag.fill": "shopping-bag",
  "clock.fill": "history",
  "doc.text": "description",
  qrcode: "qr-code-scanner",
  plus: "add",
  minus: "remove",
  checkmark: "check",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  magnifyingglass: "search",
  "camera.fill": "camera-alt",
  "photo.fill": "photo-library",
  pencil: "edit",
  "pencil.circle.fill": "edit",
  "exclamationmark.triangle.fill": "warning",
  trash: "delete",
  "trash.fill": "delete",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  xmark: "close",
  "checkmark.circle.fill": "check-circle",
  "square.and.arrow.down": "file-download",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "person.fill": "person",
  "envelope.fill": "email",
  "building.2.fill": "business",
  "arrow.uturn.backward": "replay",
  "dollarsign.circle.fill": "attach-money",
  "gearshape.fill": "settings",
  "person.badge.plus": "person-add",
  "person.2.fill": "group",
  "checkmark.seal.fill": "verified",
  "xmark.circle.fill": "cancel",
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.pie.fill": "pie-chart",
  "chart.bar.fill": "bar-chart",
  "moon.fill": "nightlight-round",
  "sun.max.fill": "brightness-high",
  "circle.lefthalf.filled": "brightness-auto",
} as const;

export type IconSymbolName = keyof typeof SF_SYMBOL_MAPPING;

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}
