import FormProductos from "@/components/forms/FormProductos";
import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from "@/lib";
import { getCategoriasByNegocio } from "@/lib/services/categorias";
import { notify } from "@/lib/notify";
import { createProduct } from "@/lib/services/productos";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import AppText from "@/components/ui/AppText";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function BackButton({ isDark }: { isDark: boolean }) {
  return (
    <Pressable
      onPress={() => router.back()}
      className="mb-6 flex-row items-center gap-2 py-2 active:opacity-70"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <IconSymbol
        name="chevron.left"
        size={18}
        color={isDark ? AppColors.dark.textSecondary : AppColors.light.textSecondary}
      />
      <AppText variant="eyebrow" style={{ fontSize: 12, lineHeight: 16 }}>
        VOLVER
      </AppText>
    </Pressable>
  );
}

export default function CreateProduct() {
  const isWeb = Platform.OS === "web";
  const sessionUserId = useSessionStore((s) => s.userId);
  const sessionNegocioId = useSessionStore((s) => s.negocioId);
  const negocioId = useProductosStore((s) => s.negocioId);
  const categories = useProductosStore((s) => s.categories);
  const loading = useProductosStore((s) => s.loading);
  const productLoading = useProductosStore((s) => s.productLoading);
  const setNegocioId = useProductosStore((s) => s.setNegocioId);
  const setCategories = useProductosStore((s) => s.setCategories);
  const setProducts = useProductosStore((s) => s.setProducts);
  const setLoading = useProductosStore((s) => s.setLoading);
  const setProductLoading = useProductosStore((s) => s.setProductLoading);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      nombre: "",
      categoria_id: "",
      precio_venta: 0,
      precio_mayoreo: 0,
      costo_promedio: 0,
      cantidad: 0,
      imagen: "",
      descripcion: "",
      marca: "",
      stock_minimo: 0,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setProductLoading(true);
        if (!sessionUserId) {
          router.replace("/");
          setProductLoading(false);
          return;
        }

        if (!sessionNegocioId) {
          Alert.alert("Error", "No tienes un negocio asignado");
          router.back();
          setProductLoading(false);
          return;
        }

        setNegocioId(sessionNegocioId);
        if (categories.length === 0) {
          const categoriasData = await getCategoriasByNegocio(sessionNegocioId);
          setCategories(categoriasData);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al cargar los datos";
        Alert.alert("Error", message);
        router.back();
      }
      setProductLoading(false);
    };

    loadData();
  }, [
    sessionUserId,
    sessionNegocioId,
    categories.length,
    setCategories,
    setNegocioId,
    setProductLoading,
  ]);

  const onSubmit = async (data: CreateProductFormData) => {
    if (!negocioId) {
      Alert.alert("Error", "No tienes un negocio asignado");
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

      const user = auth.currentUser;
      if (user) {
        const storeData = await getProductosScreenData(user.uid, user.email || "");
        setProducts(storeData.products);
      }

      notify.success({ title: "Producto creado" });
      router.replace(`/productos/producto/${productId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo crear el producto";
      notify.error({ title: "Error", description: message });
    }
    setLoading(false);
  };

  const { isDark, colors } = useThemeColors();

  if (productLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.canvas }}
      >
        <ActivityIndicator size="large" color={AppColors.primary} />
        <AppText variant="body" color={colors.textSecondary} className="mt-4">
          Cargando entorno...
        </AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: isWeb ? 48 : 20,
          maxWidth: isWeb ? 800 : undefined,
          alignSelf: isWeb ? "center" : "auto",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton isDark={isDark} />

        <AppText variant="display" className="mb-6">
          Crear Producto
        </AppText>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <FormProductos control={control} errors={errors} categories={categories} isWeb={isWeb} />
        </View>

        {/* Botones de Acción */}
        <View className="mt-8 flex-row gap-4 pb-12">
          <TouchableOpacity
            className="h-12 flex-1 flex-row items-center justify-center rounded-full active:opacity-80"
            onPress={() => router.back()}
            disabled={loading}
            style={{
              backgroundColor: colors.surfaceHover,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text
              className="text-[13px] font-bold tracking-widest"
              style={{
                color: colors.textPrimary,
                fontFamily: AppFonts.bodyStrong,
              }}
            >
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="h-12 flex-1 flex-row items-center justify-center rounded-full active:opacity-90"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            style={{
              backgroundColor: AppColors.primary,
              boxShadow: "0 8px 16px rgba(234, 88, 12, 0.25)",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className="text-[14px] font-bold tracking-wide text-white"
                style={{ fontFamily: AppFonts.bodyStrong }}
              >
                CREAR PRODUCTO
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
