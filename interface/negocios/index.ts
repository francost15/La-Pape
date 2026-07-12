export interface Negocio {
  id: string;
  nombre: string; // varchar(80)
  telefono?: string; // varchar(30)
  email?: string; // varchar(120)
  direccion?: string;
  rfc?: string; // varchar(20)
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

