export interface UsuarioNegocio {
  id: string;
  negocio_id: string; // FK
  usuario_id: string; // FK
  activo: boolean;
  createdAt?: Date;
}

export interface CreateUsuarioNegocioInput {
  negocio_id: string;
  usuario_id: string;
  activo?: boolean;
}

export interface UpdateUsuarioNegocioInput {
  activo?: boolean;
}
