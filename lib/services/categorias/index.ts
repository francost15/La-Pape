import { Categoria, CreateCategoriaInput, UpdateCategoriaInput } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

/**
 * Crear una nueva categoría
 */
export const createCategoria = async (categoriaData: CreateCategoriaInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'categorias'), {
      ...categoriaData,
      activo: categoriaData.activo ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw new Error('No se pudo crear la categoría');
  }
};

/**
 * Obtener una categoría por ID
 */
export const getCategoriaById = async (id: string): Promise<Categoria | null> => {
  try {
    const docRef = doc(db, 'categorias', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Categoria;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    throw new Error('No se pudo obtener la categoría');
  }
};

/**
 * Obtener todas las categorías
 */
export const getAllCategorias = async (): Promise<Categoria[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categorias'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Categoria;
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw new Error('No se pudieron obtener las categorías');
  }
};

/**
 * Obtener categorías por negocio_id
 */
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
    
    // Ordenar en memoria para evitar necesidad de índice compuesto
    return categorias.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener categorías por negocio:', error);
    throw new Error('No se pudieron obtener las categorías');
  }
};

/**
 * Actualizar una categoría
 */
export const updateCategoria = async (
  id: string,
  categoriaData: UpdateCategoriaInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'categorias', id);
    await updateDoc(docRef, {
      ...categoriaData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw new Error('No se pudo actualizar la categoría');
  }
};

/**
 * Eliminar una categoría
 */
export const deleteCategoria = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'categorias', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw new Error('No se pudo eliminar la categoría');
  }
};
