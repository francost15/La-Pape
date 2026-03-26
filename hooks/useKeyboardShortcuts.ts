import { useEffect, useCallback } from "react";
import { Platform } from "react-native";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || Platform.OS !== "web") return;

      const ctrl = event.ctrlKey || event.metaKey;

      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() || event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrl ? ctrl : !ctrl;

        if (keyMatches && ctrlMatches) {
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
