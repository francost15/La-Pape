import { Redirect } from "expo-router";

/**
 * Ruta raíz: redirige a auth si no hay sesión, o a ventas si hay sesión.
 * Resuelve el warning "No route named index exists in nested children".
 */
export default function Index() {
  // Redirect hace la redirección inicial; la lógica de auth está en (auth) y (tabs)
  return <Redirect href="/(auth)" />;
}
