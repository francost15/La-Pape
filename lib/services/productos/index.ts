import { Categoria, CreateProductInput, Product, UpdateProductInput } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getCategoriasByNegocio } from '../categorias';
import { getNegocioIdByUsuario } from '../usuarios-negocios';

export const createProduct = async (productData: CreateProductInput): Promise<string> => {
  try {
    const cleanData: Record<string, unknown> = {
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

    if (productData.imagen) cleanData.imagen = productData.imagen;
    if (productData.descripcion) cleanData.descripcion = productData.descripcion;
    if (productData.marca) cleanData.marca = productData.marca;
    if (productData.stock_minimo !== undefined && productData.stock_minimo !== null) {
      cleanData.stock_minimo = productData.stock_minimo;
    }

    const docRef = await addDoc(collection(db, 'productos'), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw new Error('No se pudo crear el producto');
  }
};

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
    
    return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener productos por negocio:', error);
    throw new Error('No se pudieron obtener los productos');
  }
};

export const updateProduct = async (
  id: string,
  productData: UpdateProductInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'productos', id);
    
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    Object.keys(productData).forEach((key) => {
      const value = (productData as Record<string, unknown>)[key];
      
      if (value === undefined) return;
      
      if (value === null) {
        updateData[key] = deleteField();
      } else if (value === '' && (key === 'imagen' || key === 'descripcion' || key === 'marca')) {
        updateData[key] = deleteField();
      } else {
        updateData[key] = value;
      }
    });

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw new Error('No se pudo actualizar el producto');
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'productos', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw new Error('No se pudo eliminar el producto');
  }
};

export const getProductosScreenData = async (
  userId: string,
  email?: string
): Promise<{ products: Product[]; categories: Categoria[] }> => {
  const negocioId = await getNegocioIdByUsuario(userId, email || '');

  if (!negocioId) {
    throw new Error('No tienes un negocio asignado');
  }

  const [products, categories] = await Promise.all([
    getProductsByNegocio(negocioId),
    getCategoriasByNegocio(negocioId),
  ]);

  return { products, categories };
};
