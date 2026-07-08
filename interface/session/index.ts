import type { User } from "firebase/auth";

export interface SessionStore {
  userId: string | null;
  userEmail: string | null;
  displayName: string | null;
  photoURL: string | null;
  negocioId: string | null;
  sucursalId: string | null;
  ready: boolean;
  error: string | null;

  hydrate: (user: User) => Promise<void>;
  clear: () => void;
}
