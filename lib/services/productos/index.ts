import { CreateProductInput, Product, UpdateProductInput } from '@/interface/products';
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
  where
} from 'firebase/firestore';

/**
 * Crear un nuevo producto
 * La colección "productos" se crea automáticamente si no existe
 */
export const createProduct = async (productData: CreateProductInput): Promise<string> => {
  try {
    // Filtrar campos undefined para evitar errores en Firestore
    const cleanData: any = {
      negocio_id: productData.negocio_id,
      nombre: productData.nombre,
      categoria_id: productData.categoria_id,
      precio_venta: productData.precio_venta,
      precio_mayoreo: productData.precio_mayoreo,
      costo_promedio: productData.costo_promedio,
      cantidad: productData.cantidad,
      activo: productData.activo ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Agregar campos opcionales solo si tienen valor
    if (productData.imagen) cleanData.imagen = productData.imagen;
    if (productData.descripcion) cleanData.descripcion = productData.descripcion;
    if (productData.marca) cleanData.marca = productData.marca;
    if (productData.stock_minimo !== undefined && productData.stock_minimo !== null) {
      cleanData.stock_minimo = productData.stock_minimo;
    }

    const docRef = await addDoc(collection(db, 'productos'), cleanData);
    // El ID del documento es el UUID que se usa como código de barras
    return docRef.id;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw new Error('No se pudo crear el producto');
  }
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'productos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw new Error('No se pudo obtener el producto');
  }
};

/**
 * Obtener todos los productos
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw new Error('No se pudieron obtener los productos');
  }
};

/**
 * Obtener productos por negocio_id
 */
export const getProductsByNegocio = async (negocio_id: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'productos'),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const productos = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    });
    
    // Ordenar en memoria para evitar necesidad de índice compuesto
    return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener productos por negocio:', error);
    throw new Error('No se pudieron obtener los productos');
  }
};

/**
 * Obtener productos por categoria_id
 */
export const getProductsByCategoria = async (categoria_id: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'productos'),
      where('categoria_id', '==', categoria_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const productos = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    });
    
    // Ordenar en memoria para evitar necesidad de índice compuesto
    return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    throw new Error('No se pudieron obtener los productos');
  }
};

/**
 * Actualizar un producto
 */
export const updateProduct = async (
  id: string,
  productData: UpdateProductInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'productos', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw new Error('No se pudo actualizar el producto');
  }
};

/**
 * Eliminar un producto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'productos', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw new Error('No se pudo eliminar el producto');
  }
};
