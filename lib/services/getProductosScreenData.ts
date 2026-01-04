import { getCategoriasByNegocio } from './categorias';
import { getProductsByNegocio } from './productos';
import { getNegocioIdByUsuario } from './usuarios-negocios';

export async function getProductosScreenData(
  userId: string,
  email?: string
) {
  const negocioId = await getNegocioIdByUsuario(userId, email || '');

  if (!negocioId) {
    throw new Error('No tienes un negocio asignado');
  }

  const [products, categories] = await Promise.all([
    getProductsByNegocio(negocioId),
    getCategoriasByNegocio(negocioId),
  ]);

  return { products, categories };
}
