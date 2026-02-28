import { IconSymbol } from "@/components/ui/icon-symbol";
import { Usuario } from "@/interface";
import { auth } from "@/lib/firebase";
import { getUsuarioById } from "@/lib/services/usuarios";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Navbar() {
  const isWeb = Platform.OS === "web";
  const [user, setUser] = useState<User | null>(null);
  const [usuarioData, setUsuarioData] = useState<Usuario | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  /** En web el navegador puede bloquear la foto (ORB/CORS); si falla, mostramos la inicial */
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  const loadUsuario = useCallback(async (uid: string) => {
    try {
      const data = await getUsuarioById(uid);
      setUsuarioData(data);
    } catch {
      setUsuarioData(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setPhotoLoadFailed(false);
      if (u) loadUsuario(u.uid);
      else setUsuarioData(null);
    });
    return () => unsubscribe();
  }, [loadUsuario]);

  const handleSignOut = async () => {
    setMenuVisible(false);
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const nombre = usuarioData?.nombre ?? user?.displayName ?? null;
  const email = user?.email ?? usuarioData?.email ?? "";
  const inicial = (
    nombre?.[0] ??
    user?.displayName?.[0] ??
    email?.[0] ??
    "?"
  ).toUpperCase();

  return (
    <View
      className={`${isWeb ? "web-navbar" : "mobile-navbar"} flex-row justify-between items-center bg-gray-100 dark:bg-neutral-800 px-4 py-3 ${isWeb ? "" : "pt-18"}`}
    >
      <Link
        href="/ventas"
        className={`${isWeb ? "px-2 py-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors" : ""}`}
      >
        <Image
          source={require("@/assets/images/pape.png")}
          style={{ width: 110, height: 30 }}
        />
      </Link>

      {user && (
        <>
          {/* Avatar (abre mini menú de usuario) */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.8}
            className="rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-600"
            style={{ width: 60, height: 60 }}
          >
            {user.photoURL && !photoLoadFailed ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                contentFit="cover"
                onError={() => setPhotoLoadFailed(true)}
              />
            ) : (
              <View
                className="flex-1 items-center justify-center bg-gray-300 dark:bg-neutral-600"
                style={{ width: 60, height: 60 }}
              >
                <Text
                  className="font-bold text-gray-700 dark:text-gray-200"
                  style={{ fontSize: 18 }}
                >
                  {inicial}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Mini menú de usuario */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
              onPress={() => setMenuVisible(false)}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                className="rounded-t-2xl bg-gray-100 dark:bg-neutral-800 p-6"
              >
                <View className="mb-4 flex-row items-center gap-3">
                  {user.photoURL && !photoLoadFailed ? (
                    <Image
                      source={{ uri: user.photoURL }}
                      style={{ width: 56, height: 56, borderRadius: 28 }}
                      contentFit="cover"
                      onError={() => setPhotoLoadFailed(true)}
                    />
                  ) : (
                    <View
                      className="items-center justify-center rounded-full bg-gray-300 dark:bg-neutral-600"
                      style={{ width: 56, height: 56 }}
                    >
                      <Text className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                        {inicial}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {nombre ?? "Usuario"}
                    </Text>
                  </View>
                </View>
                <View className="mb-4 gap-1">
                  {email ? (
                    <Text className="text-sm text-gray-500 dark:text-gray-500">
                      {email}
                    </Text>
                  ) : null}
                  {usuarioData?.telefono ? (
                    <Text className="text-sm text-gray-500 dark:text-gray-500">
                      {usuarioData.telefono}
                    </Text>
                  ) : null}
                </View>

                {/* Ir a Configuración */}
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/configuracion");
                  }}
                  className="flex-row items-center gap-3 py-3 px-4 rounded-xl bg-gray-200 dark:bg-neutral-700 mb-3 active:opacity-80"
                >
                  <IconSymbol name="gearshape.fill" size={18} color="#6b7280" />
                  <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Configuración
                  </Text>
                  <View className="flex-1" />
                  <IconSymbol name="chevron.right" size={14} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSignOut}
                  className="rounded-xl bg-red-100 py-3 dark:bg-red-900/30"
                >
                  <Text className="text-center font-semibold text-red-600 dark:text-red-400">
                    Cerrar sesión
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </View>
  );
}
