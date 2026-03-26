import { useCallback, useRef } from "react";

interface UndoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialPresent: T) {
  const state = useRef<UndoState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.current.past.length > 0;
  const canRedo = state.current.future.length > 0;

  const set = useCallback((newPresent: T) => {
    state.current = {
      past: [...state.current.past, state.current.present],
      present: newPresent,
      future: [],
    };
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = state.current.past[state.current.past.length - 1];
    const newPast = state.current.past.slice(0, -1);

    state.current = {
      past: newPast,
      present: previous,
      future: [state.current.present, ...state.current.future],
    };
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = state.current.future[0];
    const newFuture = state.current.future.slice(1);

    state.current = {
      past: [...state.current.past, state.current.present],
      present: next,
      future: newFuture,
    };
  }, [canRedo]);

  return { present: state.current.present, set, undo, redo, canUndo, canRedo };
}
