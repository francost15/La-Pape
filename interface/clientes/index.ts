export interface Cliente {
  id: string;
  negocio_id: string; // FK
  nombre: string; // varchar(120)
  telefono?: string; // varchar(30)
  email?: string; // varchar(120)
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateClienteInput {
  negocio_id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface UpdateClienteInput {
  nombre?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}
