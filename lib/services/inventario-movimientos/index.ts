import { CreateInventarioMovimientoInput, InventarioMovimiento } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

/**
 * Crear un nuevo movimiento de inventario
 */
export const createInventarioMovimiento = async (
  movimientoData: CreateInventarioMovimientoInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'inventario_movimientos'), {
      ...movimientoData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear movimiento de inventario:', error);
    throw new Error('No se pudo crear el movimiento de inventario');
  }
};

/**
 * Obtener un movimiento por ID
 */
export const getInventarioMovimientoById = async (
  id: string
): Promise<InventarioMovimiento | null> => {
  try {
    const docRef = doc(db, 'inventario_movimientos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as InventarioMovimiento;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener movimiento de inventario:', error);
    throw new Error('No se pudo obtener el movimiento de inventario');
  }
};

/**
 * Obtener todos los movimientos de inventario
 */
export const getAllInventarioMovimientos = async (): Promise<InventarioMovimiento[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'inventario_movimientos'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as InventarioMovimiento;
    });
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);
    throw new Error('No se pudieron obtener los movimientos de inventario');
  }
};

/**
 * Obtener movimientos por producto_id
 */
export const getMovimientosByProducto = async (
  producto_id: string
): Promise<InventarioMovimiento[]> => {
  try {
    const q = query(
      collection(db, 'inventario_movimientos'),
      where('producto_id', '==', producto_id),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as InventarioMovimiento;
    });
  } catch (error) {
    console.error('Error al obtener movimientos por producto:', error);
    throw new Error('No se pudieron obtener los movimientos');
  }
};

/**
 * Obtener movimientos por sucursal_id
 */
export const getMovimientosBySucursal = async (
  sucursal_id: string
): Promise<InventarioMovimiento[]> => {
  try {
    const q = query(
      collection(db, 'inventario_movimientos'),
      where('sucursal_id', '==', sucursal_id),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as InventarioMovimiento;
    });
  } catch (error) {
    console.error('Error al obtener movimientos por sucursal:', error);
    throw new Error('No se pudieron obtener los movimientos');
  }
};
