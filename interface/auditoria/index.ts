export interface AuditWrite {
  negocio_id: string;
  usuario_id: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  diff?: Record<string, string | number | boolean | null>;
}

export interface AuditEntry extends AuditWrite {
  id: string;
  createdAt?: Date;
}
