
import CardProducts from '@/components/cards/card-products';
import { Platform, ScrollView, View } from 'react-native';

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
      contentContainerStyle={{ padding: isWeb ? 24 : 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row flex-wrap gap-4 justify-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className={isWeb ? 'w-80' : 'w-48'}>
            <CardProducts product={product} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

