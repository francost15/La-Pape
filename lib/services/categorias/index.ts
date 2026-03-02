import { Categoria } from '@/interface';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export const getCategoriasByNegocio = async (negocio_id: string): Promise<Categoria[]> => {
  try {
    const q = query(
      collection(db, 'categorias'),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const categorias = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Categoria;
    });
    
    return categorias.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener categorías por negocio:', error);
    throw new Error('No se pudieron obtener las categorías');
  }
};
