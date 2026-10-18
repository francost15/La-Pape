import type { AuditEntry, AuditWrite } from "@/interface/auditoria";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentReference,
} from "firebase/firestore";

interface AuditWriter {
  set(ref: DocumentReference, data: Record<string, unknown>): unknown;
}

/** Encola la bitácora en la misma transacción o batch que el cambio de negocio. */
export function appendAudit(writer: AuditWriter, entry: AuditWrite): void {
  writer.set(doc(collection(db, "auditoria")), {
    ...entry,
    createdAt: Timestamp.now(),
  });
}

/**
 * Índice compuesto: auditoria (negocio_id ASC, createdAt DESC).
 * Ver firestore.indexes.json.
 */
export async function getAuditoria(negocioId: string): Promise<AuditEntry[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "auditoria"),
      where("negocio_id", "==", negocioId),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  );
  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      negocio_id: String(data.negocio_id ?? ""),
      usuario_id: String(data.usuario_id ?? ""),
      accion: String(data.accion ?? ""),
      entidad: String(data.entidad ?? ""),
      entidad_id: String(data.entidad_id ?? ""),
      diff: data.diff as AuditEntry["diff"],
      createdAt: data.createdAt?.toDate?.() ?? undefined,
    };
  });
}
