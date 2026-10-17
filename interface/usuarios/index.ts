export type UserRole = "ADMIN" | "VENDEDOR" | "CAJERO";

export interface Usuario {
  id: string;
  email: string; // varchar(80)
  password: string; // varchar(80) - hash en Firebase Auth
  nombre: string; // varchar(80)
  telefono?: string; // varchar(30)
  foto?: string; // URL de avatar
  rol: UserRole;
  activo: boolean;
  createdAt?: Date;
  last_login?: Date;
}

export interface UpdateUsuarioInput {
  email?: string;
  nombre?: string;
  telefono?: string;
  rol?: UserRole;
  activo?: boolean;
}

/** DTO de display para listas y mapas de usuarios (nombre, foto). */
export interface UsuarioInfo {
  nombre: string;
  email?: string;
  foto?: string;
}

export type UsuariosMap = Record<string, UsuarioInfo>;

export interface CreateUserWithAuthInput {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  negocioId: string;
}
