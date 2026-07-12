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

