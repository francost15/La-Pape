import type { UserRole } from "@/interface/usuarios";

export interface UsuarioNegocio {
  id: string;
  negocio_id: string; // FK
  usuario_id: string; // FK
  rol?: UserRole;
  activo: boolean;
  createdAt?: Date;
}

export interface CreateUsuarioNegocioInput {
  negocio_id: string;
  usuario_id: string;
  rol?: UserRole;
  activo?: boolean;
}

export interface UpdateUsuarioNegocioInput {
  rol?: UserRole;
  activo?: boolean;
}
