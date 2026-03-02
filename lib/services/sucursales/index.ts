import { Sucursal } from '@/interface';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export const getSucursalesByNegocio = async (negocio_id: string): Promise<Sucursal[]> => {
  try {
    const q = query(
      collection(db, 'sucursales'),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true),
    );

    const querySnapshot = await getDocs(q);
    const sucursales = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Sucursal;
    });

    return sucursales.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener sucursales por negocio:', error);
    throw new Error('No se pudieron obtener las sucursales');
  }
};
