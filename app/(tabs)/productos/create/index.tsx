import FormProductos from "@/components/forms/FormProductos";
import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from "@/lib";
import { getCategoriasByNegocio } from "@/lib/services/categorias";
import { notify } from "@/lib/notify";
import { createProduct } from "@/lib/services/productos";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { useProductosStore } from "@/store/productos-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
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
      <Text
        className="text-xs font-bold tracking-widest text-[#6B7280] uppercase dark:text-[#8B95A5]"
        style={{ fontFamily: AppFonts.bodyStrong }}
      >
        VOLVER
      </Text>
    </Pressable>
  );
}

export default function CreateProduct() {
  const isWeb = Platform.OS === "web";
  const negocioId = useProductosStore((s) => s.negocioId);
  const categories = useProductosStore((s) => s.categories);
  const setNegocioId = useProductosStore((s) => s.setNegocioId);
  const setCategories = useProductosStore((s) => s.setCategories);
  const setProducts = useProductosStore((s) => s.setProducts);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
        const user = auth.currentUser;
        if (!user) {
          router.replace("/");
          return;
        }

        // Cargar negocio y categorías
        const currentNegocioId = await getNegocioIdByUsuario(user.uid, user.email || "");
        if (!currentNegocioId) {
          Alert.alert("Error", "No tienes un negocio asignado");
          router.back();
          return;
        }

        setNegocioId(currentNegocioId);
        const categoriasData = await getCategoriasByNegocio(currentNegocioId);
        setCategories(categoriasData);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al cargar los datos";
        Alert.alert("Error", message);
        router.back();
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Refrescar los productos en el store para que se actualice la lista
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
    } finally {
      setLoading(false);
    }
  };

  const { isDark, colors } = useThemeColors();

  if (loadingData) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.canvas }}
      >
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text
          className="mt-4"
          style={{
            color: colors.textSecondary,
            fontFamily: AppFonts.body,
          }}
        >
          Cargando entorno...
        </Text>
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

        <Text
          className="mb-6 text-3xl tracking-tighter"
          style={{
            color: colors.textPrimary,
            fontFamily: AppFonts.display,
          }}
        >
          Crear Producto
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            boxShadow: Platform.OS === "web" ? "0 12px 24px rgba(0,0,0,0.04)" : undefined,
            elevation: Platform.OS !== "web" ? 4 : undefined,
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
              className="text-[13px] font-bold tracking-widest uppercase"
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
              boxShadow: Platform.OS === "web" ? "0 8px 16px rgba(234, 88, 12, 0.25)" : undefined,
              elevation: Platform.OS !== "web" ? 6 : undefined,
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
