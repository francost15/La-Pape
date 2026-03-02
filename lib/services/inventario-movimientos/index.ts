import { CreateInventarioMovimientoInput } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';

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
