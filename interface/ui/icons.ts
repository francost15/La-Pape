import { SF_SYMBOL_MAPPING } from "@/constants/sf-symbol-mapping";
import type { SymbolWeight } from "expo-symbols";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

export type IconSymbolName = keyof typeof SF_SYMBOL_MAPPING;

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}
