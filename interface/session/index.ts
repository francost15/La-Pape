import type { LoginFormData } from "@/lib/validations/auth-schema";
import type { Usuario } from "@/interface/usuarios";
import type { User } from "firebase/auth";
import type { Control, FieldErrors, UseFormHandleSubmit } from "react-hook-form";

/** Sucursal que la caja puede elegir. El id sigue siendo la FK de la venta. */
export interface SucursalSesion {
  id: string;
  nombre: string;
}

export interface SessionStore {
  userId: string | null;
  userEmail: string | null;
  displayName: string | null;
  photoURL: string | null;
  usuarioDoc: Usuario | null;
  negocioId: string | null;
  negocioNombre: string | null;
  sucursales: SucursalSesion[];
  sucursalId: string | null;
  sucursalNombre: string | null;
  ready: boolean;
  error: string | null;

  hydrate: (user: User) => Promise<void>;
  patchProfile: (data: { displayName?: string | null }) => void;
  setSucursal: (sucursalId: string) => void;
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
