import { Categoria, CreateProductInput, Product, UpdateProductInput } from '@/interface';
import { db } from '@/lib/firebase';
import { createConverter } from '@/lib/utils/firestore-converter';
import { AppError, ProductNotFoundError, NotFoundError } from '@/lib/errors';
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

const productConverter = createConverter<Product>();

/**
 * Creates a new product in the database.
 * Pre-processes the input to ensure all optional string fields are correctly formatted 
 * before writing to Firestore.
 * 
 * @param productData - The required parameters to create a product
 * @returns The generated Firestore document ID for the new product
 * @throws AppError if the insertion fails
 */
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

    const docRef = await addDoc(collection(db, 'productos').withConverter(productConverter), cleanData as any);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw new AppError('No se pudo crear el producto', 'CREATE_PRODUCT_ERROR');
  }
};

/**
 * Retrieves a single product by its ID.
 * 
 * @param id - The Firestore document ID of the product
 * @returns The Product object if found, or null if it doesn't exist
 * @throws AppError if the read operation fails
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'productos', id).withConverter(productConverter);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw new AppError('No se pudo obtener el producto', 'GET_PRODUCT_ERROR');
  }
};

/**
 * Fetches all active products belonging to a specific business.
 * The results are sorted alphabetically by product name for better UI display.
 * 
 * @param negocio_id - The ID of the business to query
 * @returns An array of active Product objects
 * @throws AppError if the query fails
 */
export const getProductsByNegocio = async (negocio_id: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'productos').withConverter(productConverter),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const productos = querySnapshot.docs.map((doc) => doc.data());
    
    return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al obtener productos por negocio:', error);
    throw new AppError('No se pudieron obtener los productos', 'GET_PRODUCTS_ERROR');
  }
};

/**
 * Partially updates an existing product.
 * Automatically handles the deletion of optional fields (like images or descriptions)
 * from Firestore if they are explicitly set to null or empty strings.
 * 
 * @param id - The Firestore document ID of the product
 * @param productData - The fields to update
 * @throws AppError if the update operation fails
 */
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
      
      // HACK: Translate nulls or empty strings into Firestore deleteField() 
      // instructions to completely remove the property from the document instead of saving empty strings
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
    throw new AppError('No se pudo actualizar el producto', 'UPDATE_PRODUCT_ERROR');
  }
};

/**
 * Permanently deletes a product document from Firestore.
 * 
 * @param id - The Firestore document ID of the product
 * @throws AppError if the deletion fails
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'productos', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw new AppError('No se pudo eliminar el producto', 'DELETE_PRODUCT_ERROR');
  }
};

/**
 * Aggregates all necessary data to render the Products dashboard screen.
 * Resolves the user's business ID, then fetches both the catalog and categories in parallel.
 * 
 * @param userId - The ID of the current authenticated user
 * @param email - The email of the current authenticated user
 * @returns Object containing the lists of products and categories
 * @throws AppError if the user is not associated with any business
 */
export const getProductosScreenData = async (
  userId: string,
  email?: string
): Promise<{ products: Product[]; categories: Categoria[] }> => {
  const negocioId = await getNegocioIdByUsuario(userId, email || '');

  if (!negocioId) {
    throw new AppError('No tienes un negocio asignado', 'NEGOCIO_NOT_FOUND');
  }

  // Performance: Run these two independent queries concurrently to reduce load times
  const [products, categories] = await Promise.all([
    getProductsByNegocio(negocioId),
    getCategoriasByNegocio(negocioId),
  ]);

  return { products, categories };
};
