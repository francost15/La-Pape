import type { Negocio } from "@/interface/negocios";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getNegocioById(negocioId: string): Promise<Negocio | null> {
  const snap = await getDoc(doc(db, "negocios", negocioId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    nombre: typeof data.nombre === "string" ? data.nombre : "",
    telefono: typeof data.telefono === "string" ? data.telefono : undefined,
    email: typeof data.email === "string" ? data.email : undefined,
    direccion: typeof data.direccion === "string" ? data.direccion : undefined,
    rfc: typeof data.rfc === "string" ? data.rfc : undefined,
    activo: data.activo !== false,
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
}
