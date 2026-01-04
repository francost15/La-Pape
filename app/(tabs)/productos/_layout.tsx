import { Stack } from 'expo-router';

export default function ProductosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="producto/[id]" 
        options={{ headerShown: true, title: 'Producto' }}
      />
      <Stack.Screen name="create/index" />
    </Stack>
  );
}
