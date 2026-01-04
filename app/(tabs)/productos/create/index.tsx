import { auth } from '@/lib/firebase';
import { getCategoriasByNegocio } from '@/lib/services/categorias';
import { createProduct } from '@/lib/services/productos';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { CreateProductFormData, createProductSchema } from '@/lib/validations/product-schema';
import { useProductosStore } from '@/store/productos-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Picker solo para móvil, en web usamos select nativo

export default function CreateProduct() {
  const isWeb = Platform.OS === 'web';
  const { negocioId, categories, setNegocioId, setCategories } = useProductosStore();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      nombre: '',
      categoria_id: '',
      precio_venta: 0,
      precio_mayoreo: 0,
      costo_promedio: 0,
      cantidad: 0,
      imagen: '',
      descripcion: '',
      marca: '',
      stock_minimo: 0,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace('/');
          return;
        }

        // Cargar negocio y categorías
        const currentNegocioId = await getNegocioIdByUsuario(user.uid, user.email || '');
        if (!currentNegocioId) {
          Alert.alert('Error', 'No tienes un negocio asignado');
          router.back();
          return;
        }

        setNegocioId(currentNegocioId);
        const categoriasData = await getCategoriasByNegocio(currentNegocioId);
        setCategories(categoriasData);
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Error al cargar los datos');
        router.back();
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: CreateProductFormData) => {
    if (!negocioId) {
      Alert.alert('Error', 'No tienes un negocio asignado');
      return;
    }

    try {
      setLoading(true);
      const productId = await createProduct({
        negocio_id: negocioId,
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio_venta: data.precio_venta,
        precio_mayoreo: data.precio_mayoreo,
        costo_promedio: data.costo_promedio,
        cantidad: data.cantidad,
        imagen: data.imagen || undefined,
        descripcion: data.descripcion || undefined,
        marca: data.marca || undefined,
        stock_minimo: data.stock_minimo || undefined,
      });
      
      reset();
      
      // Navegar directamente al producto creado
      router.replace(`/productos/producto/${productId}`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-100 dark:bg-neutral-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: isWeb ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-black dark:text-white mb-6">
          Crear Producto
        </Text>

        <View className="space-y-4">
          {/* Nombre */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Producto *
            </Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white dark:bg-neutral-800 border ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                  } rounded-lg px-4 py-3 text-black dark:text-white`}
                  placeholder="Ej: Lápiz HB #2"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.nombre && (
              <Text className="text-red-500 text-xs mt-1">{errors.nombre.message}</Text>
            )}
          </View>

          {/* Categoría */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </Text>
            <Controller
              control={control}
              name="categoria_id"
              render={({ field: { onChange, value } }) => (
                <View className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg overflow-hidden">
                  {isWeb ? (
                    <select
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        border: 'none',
                        outline: 'none',
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <TouchableOpacity
                        className="px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowCategoryModal(true)}
                      >
                        <Text className={`${value ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                          {value ? categories.find(c => c.id === value)?.nombre || 'Selecciona una categoría' : 'Selecciona una categoría'}
                        </Text>
                        <Text className="text-gray-400">▼</Text>
                      </TouchableOpacity>
                      <Modal
                        visible={showCategoryModal}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCategoryModal(false)}
                      >
                        <View className="flex-1 bg-black/50 justify-end">
                          <View className="bg-white dark:bg-neutral-800 rounded-t-3xl p-6 max-h-[80%]">
                            <View className="flex-row justify-between items-center mb-4">
                              <Text className="text-xl font-bold text-black dark:text-white">
                                Seleccionar Categoría
                              </Text>
                              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Text className="text-orange-600 text-lg font-semibold">Cerrar</Text>
                              </TouchableOpacity>
                            </View>
                            <ScrollView>
                              {categories.map((cat) => (
                                <TouchableOpacity
                                  key={cat.id}
                                  className={`p-4 mb-2 rounded-lg ${
                                    value === cat.id 
                                      ? 'bg-orange-600' 
                                      : 'bg-gray-100 dark:bg-neutral-700'
                                  }`}
                                  onPress={() => {
                                    onChange(cat.id);
                                    setShowCategoryModal(false);
                                  }}
                                >
                                  <Text
                                    className={`${
                                      value === cat.id 
                                        ? 'text-white font-semibold' 
                                        : 'text-black dark:text-white'
                                    }`}
                                  >
                                    {cat.nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      </Modal>
                    </>
                  )}
                </View>
              )}
            />
            {errors.categoria_id && (
              <Text className="text-red-500 text-xs mt-1">{errors.categoria_id.message}</Text>
            )}
          </View>

          {/* Precios - Grid en web, columna en móvil */}
          <View className={isWeb ? 'flex-row gap-4' : 'space-y-4'}>
            <View className={isWeb ? 'flex-1' : ''}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio de Venta *
              </Text>
              <Controller
                control={control}
                name="precio_venta"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-white dark:bg-neutral-800 border ${
                      errors.precio_venta ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                    } rounded-lg px-4 py-3 text-black dark:text-white`}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.precio_venta && (
                <Text className="text-red-500 text-xs mt-1">{errors.precio_venta.message}</Text>
              )}
            </View>

            <View className={isWeb ? 'flex-1' : ''}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Mayoreo *
              </Text>
              <Controller
                control={control}
                name="precio_mayoreo"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-white dark:bg-neutral-800 border ${
                      errors.precio_mayoreo ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                    } rounded-lg px-4 py-3 text-black dark:text-white`}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.precio_mayoreo && (
                <Text className="text-red-500 text-xs mt-1">{errors.precio_mayoreo.message}</Text>
              )}
            </View>
          </View>

          {/* Costo y Cantidad */}
          <View className={isWeb ? 'flex-row gap-4' : 'space-y-4'}>
            <View className={isWeb ? 'flex-1' : ''}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Costo Promedio *
              </Text>
              <Controller
                control={control}
                name="costo_promedio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-white dark:bg-neutral-800 border ${
                      errors.costo_promedio ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                    } rounded-lg px-4 py-3 text-black dark:text-white`}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.costo_promedio && (
                <Text className="text-red-500 text-xs mt-1">{errors.costo_promedio.message}</Text>
              )}
            </View>

            <View className={isWeb ? 'flex-1' : ''}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad en Stock *
              </Text>
              <Controller
                control={control}
                name="cantidad"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-white dark:bg-neutral-800 border ${
                      errors.cantidad ? 'border-red-500' : 'border-gray-300 dark:border-neutral-700'
                    } rounded-lg px-4 py-3 text-black dark:text-white`}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.cantidad && (
                <Text className="text-red-500 text-xs mt-1">{errors.cantidad.message}</Text>
              )}
            </View>
          </View>

          {/* Campos opcionales */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marca
            </Text>
            <Controller
              control={control}
              name="marca"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
                  placeholder="Ej: Faber-Castell"
                  placeholderTextColor="#9ca3af"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.marca && (
              <Text className="text-red-500 text-xs mt-1">{errors.marca.message}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </Text>
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
                  placeholder="Descripción del producto..."
                  placeholderTextColor="#9ca3af"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.descripcion && (
              <Text className="text-red-500 text-xs mt-1">{errors.descripcion.message}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de Imagen
            </Text>
            <Controller
              control={control}
              name="imagen"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
                  placeholder="https://..."
                  placeholderTextColor="#9ca3af"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.imagen && (
              <Text className="text-red-500 text-xs mt-1">{errors.imagen.message}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Mínimo
            </Text>
            <Controller
              control={control}
              name="stock_minimo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
              )}
            />
            {errors.stock_minimo && (
              <Text className="text-red-500 text-xs mt-1">{errors.stock_minimo.message}</Text>
            )}
          </View>
        </View>

        {/* Botones */}
        <View className={`flex-row gap-3 mt-6 ${isWeb ? 'justify-end' : ''}`}>
          <TouchableOpacity
            className="flex-1 bg-gray-300 dark:bg-neutral-700 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-orange-600 px-6 py-3 rounded-lg"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">Crear Producto</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
