import type { LoginFormData } from "@/lib/validations/auth-schema";
import type { Usuario } from "@/interface/usuarios";
import type { User } from "firebase/auth";
import type { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";

export interface SessionStore {
  userId: string | null;
  userEmail: string | null;
  displayName: string | null;
  photoURL: string | null;
  usuarioDoc: Usuario | null;
  negocioId: string | null;
  sucursalId: string | null;
  ready: boolean;
  error: string | null;

  hydrate: (user: User) => Promise<void>;
  patchProfile: (data: { displayName?: string | null }) => void;
  clear: () => void;
}

export interface AuthFormProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  onGooglePress: () => Promise<void>;
  loading: boolean;
  isSignUp: boolean;
  onToggleSignUp: () => void;
}

