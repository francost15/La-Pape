import React from "react";
import { View } from "react-native";
import type { SectionCardProps } from "@/interface/resumen";

/**
 * SectionCard — Digital Atelier style.
 *
 * FLAT container — NO border, NO shadow, NO card chrome.
 * Just transparent padding with optional title.
 * The section title (if any) is now handled by the parent screen
 * via SectionTitle component. This wrapper exists only for layout.
 */
export default function SectionCard({
  title: _title,
  children,
  style,
  className: extraClassName,
  ...viewProps
}: SectionCardProps) {
  return (
    <View {...viewProps} className={[extraClassName].filter(Boolean).join(" ")} style={[style]}>
      {children}
    </View>
  );
}
