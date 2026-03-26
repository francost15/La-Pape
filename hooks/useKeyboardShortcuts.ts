import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export interface ShortcutAction {
  action: string;
  description: string;
}

export const DEFAULT_SHORTCUTS: Record<
  string,
  { screen?: string; action?: string; description: string }
> = {
  "ctrl+1": { screen: "/(tabs)/ventas", description: "Ir a Ventas" },
  "ctrl+2": { screen: "/(tabs)/productos", description: "Ir a Productos" },
  "ctrl+3": { screen: "/(tabs)/history", description: "Ir a Historial" },
  "ctrl+4": { screen: "/(tabs)/resumen", description: "Ir a Resumen" },
  "ctrl+n": { action: "new_sale", description: "Nueva venta" },
  "ctrl+k": { action: "search", description: "Buscar" },
  escape: { action: "close_modal", description: "Cerrar modal" },
  "ctrl+z": { action: "undo", description: "Deshacer" },
  "ctrl+shift+z": { action: "redo", description: "Rehacer" },
  "ctrl+enter": { action: "complete_sale", description: "Completar venta" },
};

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || Platform.OS !== "web") return;

      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() || event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrl ? ctrl : !ctrl;
        const shiftMatches = shortcut.shift ? shift : !shift;

        if (keyMatches && ctrlMatches && shiftMatches) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled || Platform.OS !== "web") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export function useNavigationShortcuts(enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || Platform.OS !== "web") return;

      const ctrl = event.ctrlKey || event.metaKey;
      const key = `${ctrl ? "ctrl+" : ""}${event.key.toLowerCase()}`;
      const shiftKey = `${key}+shift`;

      if (DEFAULT_SHORTCUTS[shiftKey]?.screen) {
        event.preventDefault();
        router.push(
          DEFAULT_SHORTCUTS[shiftKey].screen as
            | "/(tabs)/ventas"
            | "/(tabs)/productos"
            | "/(tabs)/history"
            | "/(tabs)/resumen"
        );
        return;
      }

      if (DEFAULT_SHORTCUTS[key]?.screen) {
        event.preventDefault();
        router.push(
          DEFAULT_SHORTCUTS[key].screen as
            | "/(tabs)/ventas"
            | "/(tabs)/productos"
            | "/(tabs)/history"
            | "/(tabs)/resumen"
        );
        return;
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled || Platform.OS !== "web") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
