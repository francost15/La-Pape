import { Stack } from 'expo-router';

export default function ProductosLayout() {
  return (
    <Stack
    screenOptions={{
      headerShown: false,
    }}
  >
      <Stack.Screen
        name="index"
        options={{
        }}
      />
      <Stack.Screen
        name="producto/[id]"
      />
      <Stack.Screen
        name="create/index"
      />
    </Stack>
  );
}
