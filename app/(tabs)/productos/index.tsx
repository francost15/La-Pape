
import CardProducts from '@/components/cards/card-products';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProductosScreen() {
  const product = {
    id: '1',
    nombre: 'Producto de Ejemplo 1',
    precio: 29.99,
    precio_mayoreo: 25.99,
    imagen: 'https://imgs.search.brave.com/DX_wldWWiJSIPvT_VyfBeHcd_b7rr6rRQNUVQz3k29E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbXMu/amliZWNkbi5jb20v/cHJvZC9naXRodWJp/bmMtY2FyZWVycy9h/c3NldHMvTFAtU0tV/LUQ0LUlNRy1lbi11/cy0xNzAxODU2ODgz/NjA2LnBuZw',
    descripcion: 'Descripción breve del producto',
    categoria: {
      id: '1',
      nombre: 'Electrónica',
    },
    stock: true,
  };

  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView
      className="flex-1 bg-gray-100 dark:bg-neutral-900"
      contentContainerStyle={{ padding: isWeb ? 21 : 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra de búsqueda */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white dark:bg-neutral-800 rounded-lg px-4 py-3 flex-row items-center ">
          <IconSymbol name="magnifyingglass" size={20} color={isWeb ? '#6b7280' : '#9ca3af'} />
          <TextInput
            className="flex-1 ml-3 text-gray-900 dark:text-white"
            placeholder="Buscar productos..."
            placeholderTextColor={isWeb ? '#9ca3af' : '#6b7280'}
          />
        </View>
        {/* boton para agregar producto */}
        <TouchableOpacity
          className="bg-blue-500 px-4 py-3 rounded-lg justify-center items-center flex-row gap-2"
          onPress={() => {}}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="white" />
          <Text className="text-white font-semibold">Agregar</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap gap-4 justify-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className={isWeb ? 'w-80' : 'w-44'}>
            <CardProducts product={product} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

