export interface Sucursal {
  id: string;
  negocio_id: string; // FK
  nombre: string; // varchar(80)
  direccion?: string;
  telefono?: string; // varchar(30)
  email?: string; // varchar(120)
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSucursalInput {
  negocio_id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface UpdateSucursalInput {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}
