import FormProductos from "@/components/forms/FormProductos";
import CampoImagen from "@/components/forms/products/CampoImagen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useHaptic } from "@/hooks/use-haptic";
import { useResponsive } from "@/hooks/use-responsive";
import type { EditProductViewProps } from "@/interface/products";
import { shadow } from "@/lib/utils/shadows";
import { useBottomTabBarHeight } from "expo-router/tabs";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { EditProductActions } from "./EditProductActions";

// A nivel de módulo para no recrear el componente en cada render (lint react-hooks).
function BackButton() {
  const router = useRouter();
  const haptic = useHaptic();
  return (
    <Pressable
      onPress={() => {
        haptic();
        router.back();
      }}
      className="mb-6 flex-row items-center gap-2 active:opacity-70"
    >
      <IconSymbol name="chevron.left" size={18} color={AppColors.light.textSecondary} />
      <Text
        className="text-xs font-bold tracking-widest text-content-secondary"
        style={{ fontFamily: AppFonts.bodyStrong }}
      >
        VOLVER
      </Text>
    </Pressable>
  );
}

export function EditProductView({
  control,
  errors,
  categories,
  loading,
  onSave,
  onCancel,
}: EditProductViewProps) {
  const isWeb = Platform.OS === "web";
  const { isDesktop } = useResponsive();
  const tabBarHeight = useBottomTabBarHeight();

  const actions = <EditProductActions loading={loading} onCancel={onCancel} onSave={onSave} />;

  if (isDesktop) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-canvas"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: "center", padding: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: "100%", maxWidth: 1200 }}>
            <BackButton />
            <View className="flex-row items-start gap-16">
              {/* Columna izquierda: Imagen hero */}
              <View className="flex-1 gap-6">
                <View
                  className="overflow-hidden rounded-[32px] bg-surface-elevated"
                  style={shadow("0 24px 48px rgba(0,0,0,0.06)", 0)}
                >
                  <CampoImagen
                    control={control}
                    errors={errors}
                    isWeb={isWeb}
                    previewSize={{ width: 480, height: 480 }}
                  />
                </View>
                <View className="px-2">
                  <Text className="mb-1 text-[10px] font-bold tracking-[0.2em] text-content-secondary">
                    Guas de Edición
                  </Text>
                  <Text className="text-xs leading-4 text-content-muted">
                    Actualiza la imagen del producto cargando un archivo o ingresando una URL
                    directa.
                  </Text>
                </View>
              </View>

              {/* Columna derecha: Formulario */}
              <View style={{ width: 480 }} className="gap-8">
                <View>
                  <Text
                    className="mb-1 text-2xl tracking-tight text-content-primary"
                    style={{ fontFamily: AppFonts.display }}
                  >
                    Editor de Producto
                  </Text>
                  <Text className="text-sm text-content-secondary">
                    Actualiza los detalles técnicos y comerciales.
                  </Text>
                </View>

                <FormProductos
                  control={control}
                  errors={errors}
                  categories={categories}
                  isWeb={isWeb}
                  hideImage
                />

                <View className="mt-4">{actions}</View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-canvas"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />
        <View className="mb-6">
          <Text
            className="text-3xl tracking-tighter text-content-primary"
            style={{ fontFamily: AppFonts.display }}
          >
            Editar
          </Text>
          <Text className="text-sm text-content-secondary">
            Modifica los campos necesarios para reflejar los cambios.
          </Text>
        </View>

        <FormProductos control={control} errors={errors} categories={categories} isWeb={isWeb} />
      </ScrollView>

      <View
        className="border-t border-line bg-canvas px-6 py-4"
        style={{ paddingBottom: 16 + tabBarHeight }}
      >
        {actions}
      </View>
    </KeyboardAvoidingView>
  );
}
