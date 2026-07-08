import type { UserRole } from "@/interface/usuarios";
import type { UsuarioNegocio } from "@/interface/usuarios-negocios";

export interface MiembroConUsuario {
  relacion: UsuarioNegocio;
  nombre: string;
  email: string;
  rol: UserRole;
  foto?: string;
  inicial: string;
}

export interface AuthUserOverride {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface EquipoStore {
  miembros: MiembroConUsuario[];
  loading: boolean;
  error: string | null;

  loadMiembros: (negocioId: string | null, authOverride?: AuthUserOverride) => Promise<void>;
  updateRol: (
    relId: string,
    userId: string,
    email: string | undefined,
    rol: UserRole
  ) => Promise<void>;
  removeMiembro: (relId: string) => Promise<void>;
  addMiembro: (miembro: MiembroConUsuario) => void;
  clear: () => void;
}

export interface ConfigTabEquipoProps {
  onRefresh: () => void;
}

export interface FormState {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  rol: UserRole;
}

export interface CrearUsuarioFormProps {
  negocioId: string | null;
  onCreated?: () => void;
}

export interface MiembroRowProps {
  miembro: MiembroConUsuario;
  currentUserId: string | null;
  onRolChange: (
    relId: string,
    userId: string,
    email: string | undefined,
    rol: UserRole
  ) => Promise<void>;
  onDesactivar: (relId: string) => Promise<void>;
}
