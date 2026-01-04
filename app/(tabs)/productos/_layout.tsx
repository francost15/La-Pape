import { Stack } from 'expo-router';

export default function ProductosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="producto/[id]/index" />
      <Stack.Screen name="create/index" />
      <Stack.Screen name="producto/[id]/edit/index" />
    </Stack>
  );
}
