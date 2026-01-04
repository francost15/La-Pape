import BadgeCategoryProducts from '@/components/badges/BadgeCategoryProducts';
import CardProducts from '@/components/cards/card-products';
import SearchProducts from '@/components/search/SearchProducts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Categoria } from '@/interface/categorias';
import { Product } from '@/interface/products';
import { auth, db } from '@/lib/firebase';
import { getCategoriasByNegocio } from '@/lib/services/categorias';
import { getProductsByNegocio } from '@/lib/services/productos';
import { getNegociosByUsuario } from '@/lib/services/usuarios-negocios';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProductosScreen() {
  const isWeb = Platform.OS === 'web';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [negocioId, setNegocioId] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user.uid, user.email || '');
      } else {
        setError('No hay usuario autenticado');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (userId: string, userEmail: string) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el negocio del usuario - intentar primero con UID de Auth
      let negociosUsuario = await getNegociosByUsuario(userId);
      
      // Si no encuentra, buscar el usuario en Firestore por email
      if (negociosUsuario.length === 0) {
        const usuariosQuery = query(
          collection(db, 'usuarios'),
          where('email', '==', userEmail)
        );
        const usuariosSnapshot = await getDocs(usuariosQuery);
        
        if (!usuariosSnapshot.empty) {
          const usuarioFirestoreId = usuariosSnapshot.docs[0].id;
          negociosUsuario = await getNegociosByUsuario(usuarioFirestoreId);
        }
      }
      
      if (negociosUsuario.length === 0) {
        setError('No tienes un negocio asignado');
        setLoading(false);
        return;
      }

      const currentNegocioId = negociosUsuario[0].negocio_id;
      setNegocioId(currentNegocioId);

      // Cargar productos y categorías en paralelo
      const [productosData, categoriasData] = await Promise.all([
        getProductsByNegocio(currentNegocioId),
        getCategoriasByNegocio(currentNegocioId),
      ]);

      // Debug: verificar imágenes
      if (__DEV__ && productosData.length > 0) {
        console.log('📦 Productos cargados:', productosData.length);
        console.log('🖼️  Primer producto imagen:', productosData[0].nombre, '->', productosData[0].imagen || 'SIN IMAGEN');
      }

      setProducts(productosData);
      setCategories(categoriasData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err?.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando productos...</Text>
      </View>
    );
  }

  const handleRetry = () => {
    const user = auth.currentUser;
    if (user) {
      loadData(user.uid, user.email || '');
    }
  };

  if (error) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-900 justify-center items-center p-4">
        <Text className="text-red-600 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-orange-600 px-4 py-3 rounded-lg"
          onPress={handleRetry}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100 dark:bg-neutral-900"
      contentContainerStyle={{ padding: isWeb ? 21 : 12 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <View />
      }
    >
      {/* Barra de búsqueda */}
      <View className="flex-row gap-3 mb-4">
        <SearchProducts />
        {/* boton para agregar producto */}
        <TouchableOpacity
          className="bg-orange-600 px-4 py-3 rounded-lg justify-center items-center flex-row gap-2"
          onPress={() => {
            router.push('/productos/create');
          }}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="white" />
          <Text className="text-white font-semibold">Agregar</Text>
        </TouchableOpacity>
      </View>
      {/* Categorias de productos ordenadas por nombre asc */}
      {categories.length > 0 && <BadgeCategoryProducts categories={categories} />}
      {/* Productos */}
      {products.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            No hay productos disponibles
          </Text>
          <TouchableOpacity
            className="bg-orange-600 px-4 py-3 rounded-lg"
            onPress={() => router.push('/productos/create')}
          >
            <Text className="text-white font-semibold">Crear primer producto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-4 justify-center">
          {products.map((product) => (
            <View key={product.id} className={isWeb ? 'w-80' : 'w-52'}>
              <CardProducts product={product} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

