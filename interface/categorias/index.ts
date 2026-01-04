export interface Categoria {
  id: string;
  negocio_id: string; // FK
  nombre: string; // varchar(80)
  descripcion?: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCategoriaInput {
  negocio_id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateCategoriaInput {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}
