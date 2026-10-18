/**
 * Migración previa al despliegue de las nuevas firestore.rules (ver header
 * de ese archivo). Hace dos cosas, ambas idempotentes:
 *
 * 1. usuarios_negocios: reescribe cada doc con ID automático al ID
 *    determinístico `${usuario_id}_${negocio_id}` que las reglas usan para
 *    validar membresía, y borra el doc viejo.
 * 2. ventas_detalle: backfill de `negocio_id` (copiado de la venta padre)
 *    en los docs legacy que no lo tienen.
 *
 * Ejecutar ANTES de desplegar las reglas, con una cuenta que hoy tenga
 * acceso (las reglas actuales solo piden autenticación):
 *
 *   MIGRATE_EMAIL=admin@... MIGRATE_PASSWORD=... npx tsx scripts/migrate-usuarios-negocios.ts
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore admite 500 operaciones por batch; margen por seguridad.
const BATCH_MAX = 400;

async function commitInChunks(
  ops: ((batch: ReturnType<typeof writeBatch>) => void)[],
  label: string
) {
  for (let i = 0; i < ops.length; i += BATCH_MAX) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + BATCH_MAX)) op(batch);
    await batch.commit();
    console.log(`${label}: ${Math.min(i + BATCH_MAX, ops.length)}/${ops.length}`);
  }
}

async function migrateMemberships() {
  const usuariosSnap = await getDocs(collection(db, "usuarios"));
  const rolByUser = new Map();
  for (const u of usuariosSnap.docs) {
    if (u.data().rol) rolByUser.set(u.id, u.data().rol);
  }

  const snap = await getDocs(collection(db, "usuarios_negocios"));
  const ops: ((batch: ReturnType<typeof writeBatch>) => void)[] = [];

  for (const d of snap.docs) {
    const data = d.data();
    if (!data.usuario_id || !data.negocio_id) {
      console.warn(`usuarios_negocios/${d.id} sin usuario_id/negocio_id — omitido`);
      continue;
    }
    const canonicalId = `${data.usuario_id}_${data.negocio_id}`;
    const rol = data.rol || rolByUser.get(data.usuario_id) || "VENDEDOR";
    if (d.id === canonicalId) {
      if (!data.rol) {
        ops.push((batch) => batch.update(d.ref, { rol }));
      }
      continue;
    }

    ops.push((batch) => {
      batch.set(doc(db, "usuarios_negocios", canonicalId), { ...data, rol });
      batch.delete(d.ref);
    });
  }

  if (!ops.length) {
    console.log("usuarios_negocios: nada que migrar");
    return;
  }
  await commitInChunks(ops, "usuarios_negocios migrados");
}

async function backfillDetalles() {
  const ventasSnap = await getDocs(collection(db, "ventas"));
  const negocioByVenta = new Map<string, string>();
  for (const v of ventasSnap.docs) {
    const negocioId = v.data().negocio_id;
    if (negocioId) negocioByVenta.set(v.id, negocioId);
  }

  const detallesSnap = await getDocs(collection(db, "ventas_detalle"));
  const ops: ((batch: ReturnType<typeof writeBatch>) => void)[] = [];

  for (const d of detallesSnap.docs) {
    const data = d.data();
    if (data.negocio_id) continue;
    const negocioId = negocioByVenta.get(data.venta_id);
    if (!negocioId) {
      console.warn(`ventas_detalle/${d.id}: venta ${data.venta_id} sin negocio_id — omitido`);
      continue;
    }
    ops.push((batch) => batch.update(d.ref, { negocio_id: negocioId }));
  }

  if (!ops.length) {
    console.log("ventas_detalle: nada que backfillear");
    return;
  }
  await commitInChunks(ops, "ventas_detalle backfilleados");
}

async function main() {
  const email = process.env.MIGRATE_EMAIL;
  const password = process.env.MIGRATE_PASSWORD;
  if (!email || !password) {
    throw new Error("Define MIGRATE_EMAIL y MIGRATE_PASSWORD en el entorno");
  }
  await signInWithEmailAndPassword(getAuth(app), email, password);

  await migrateMemberships();
  await backfillDetalles();
  console.log("Migración completa.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migración fallida:", err);
  process.exit(1);
});
