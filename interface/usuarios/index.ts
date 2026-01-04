export type UserRole = 'ADMIN' | 'VENDEDOR' | 'CAJERO';

export interface Usuario {
  id: string;
  email: string; // varchar(80)
  password: string; // varchar(80) - hash en Firebase Auth
  nombre: string; // varchar(80)
  telefono?: string; // varchar(30)
  rol: UserRole;
  activo: boolean;
  createdAt?: Date;
  last_login?: Date;
}

export interface CreateUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  activo?: boolean;
}

export interface UpdateUsuarioInput {
  email?: string;
  nombre?: string;
  telefono?: string;
  rol?: UserRole;
  activo?: boolean;
}
