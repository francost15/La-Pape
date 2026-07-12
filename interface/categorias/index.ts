export interface Categoria {
  id: string;
  negocio_id: string; // FK
  nombre: string; // varchar(80)
  descripcion?: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

