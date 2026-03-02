import {
  CreateVentaDetalleInput,
  VentaDetalle,
} from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

export const createVentaDetalle = async (
  detalleData: CreateVentaDetalleInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ventas_detalle'), {
      ...detalleData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear detalle de venta:', error);
    throw new Error('No se pudo crear el detalle de venta');
  }
};

export const getDetallesByVenta = async (venta_id: string): Promise<VentaDetalle[]> => {
  try {
    const q = query(
      collection(db, 'ventas_detalle'),
      where('venta_id', '==', venta_id)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VentaDetalle;
    });
  } catch (error) {
    console.error('Error al obtener detalles de venta:', error);
    throw new Error('No se pudieron obtener los detalles de venta');
  }
};
