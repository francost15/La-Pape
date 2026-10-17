import { IconSymbol } from "@/components/ui/icon-symbol";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useSignOut } from "@/hooks/use-sign-out";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSessionStore } from "@/store/session-store";

const isWeb = Platform.OS === "web";

export default function Navbar() {
  const insets = useSafeAreaInsets();
  const userId = useSessionStore((s) => s.userId);
  const displayName = useSessionStore((s) => s.displayName);
  const userEmail = useSessionStore((s) => s.userEmail);
  const photoURL = useSessionStore((s) => s.photoURL);
  const usuarioDoc = useSessionStore((s) => s.usuarioDoc);

  const [menuVisible, setMenuVisible] = useState(false);
  const handleSignOut = useSignOut();

  const nombre = usuarioDoc?.nombre ?? displayName ?? null;
  const email = userEmail ?? usuarioDoc?.email ?? "";

  const onSignOut = async () => {
    setMenuVisible(false);
    await handleSignOut();
  };

  return (
    <View
      className="flex-row items-center justify-between bg-canvas px-4"
      // insets.top en lugar de paddings fijos por plataforma: respeta notch,
      // Dynamic Island y variaciones de status bar en Android. La barra visible
      // conserva sus 56pt de alto por debajo del área segura.
      style={{
        height: 56 + insets.top,
        paddingTop: insets.top,
      }}
    >
      <Link
        href="/ventas"
        className={isWeb ? "rounded-lg px-2 py-2 transition-opacity hover:opacity-80" : ""}
      >
        <Image
          source={require("@/assets/images/pape.webp")}
          style={{ width: 100, height: 28 }}
          accessibilityLabel="Logo La Pape"
          accessibilityRole="image"
        />
      </Link>

      {userId && (
        <>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.8}
            className="overflow-hidden rounded-full"
            style={{
              width: 36,
              height: 36,
              backgroundColor: isWeb ? "var(--bg-surface-elevated)" : undefined,
            }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú de usuario"
            accessibilityHint="Muestra opciones de perfil y cierre de sesión"
          >
            <UserAvatar name={nombre ?? email} photoUri={photoURL} size={36} />
          </TouchableOpacity>

          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "flex-end",
              }}
              onPress={() => setMenuVisible(false)}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                style={{
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 24,
                  paddingBottom: 40,
                  backgroundColor: isWeb ? "var(--bg-surface)" : undefined,
                }}
                className="bg-surface"
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    alignSelf: "center",
                    marginBottom: 20,
                    opacity: 0.2,
                  }}
                  className="bg-content-primary"
                />

                <View className="mb-5 flex-row items-center gap-3">
                  <UserAvatar name={nombre ?? email} photoUri={photoURL} size={48} />
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-content-primary"
                      style={{ fontFamily: AppFonts.heading }}
                    >
                      {nombre ?? "Usuario"}
                    </Text>
                    {email ? (
                      <Text
                        className="text-sm text-content-secondary"
                        style={{ fontFamily: AppFonts.body }}
                      >
                        {email}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/configuracion");
                  }}
                  className="mb-3 flex-row items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-80"
                  style={{ backgroundColor: isWeb ? "var(--bg-surface-hover)" : undefined }}
                  accessibilityRole="button"
                  accessibilityLabel="Configuración"
                >
                  <IconSymbol
                    name="gearshape.fill"
                    size={18}
                    color={AppColors.light.textSecondary}
                  />
                  <Text
                    className="text-sm font-semibold text-content-primary"
                    style={{ fontFamily: AppFonts.bodyStrong }}
                  >
                    Configuración
                  </Text>
                  <View className="flex-1" />
                  <IconSymbol name="chevron.right" size={14} color={AppColors.light.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSignOut}
                  className="rounded-xl py-3.5"
                  style={{
                    backgroundColor: "rgba(220, 38, 38, 0.08)",
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar sesión"
                >
                  <Text
                    className="text-center font-semibold"
                    style={{
                      fontFamily: AppFonts.bodyStrong,
                      color: AppColors.error,
                    }}
                  >
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
