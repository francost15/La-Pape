import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from "@/lib";
import type { UpdateProductInput } from "@/interface";
import { getCategoriasByNegocio } from "@/lib/services/categorias";
import { notify } from "@/lib/notify";
import { getProductById, updateProduct } from "@/lib/services/productos";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

/**
 * Carga el producto a editar (params → store → Firestore), prepara el form con
 * sus valores y expone el submit que persiste los cambios. Mantiene la pantalla
 * de edición como puro layout.
 */
export function useEditProduct() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const router = useRouter();
  // negocioId viene del sessionStore (ya hidratado en login).
  const sessionNegocioId = useSessionStore((s) => s.negocioId);

  const {
    negocioId: storeNegocioId,
    categories,
    setNegocioId,
    setCategories,
    setProducts,
    currentProduct,
    setCurrentProduct,
  } = useProductosStore();

  const negocioId = sessionNegocioId ?? storeNegocioId;
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
          setTimeout(() => router.replace("/"), 100);
          return;
        }

        let product = null;

        if (productParam) {
          try {
            product = JSON.parse(decodeURIComponent(productParam));
          } catch {
            try {
              product = JSON.parse(productParam);
            } catch {
              /* continuar */
            }
          }
        }

        if (!product && currentProduct && currentProduct.id === id) {
          product = currentProduct;
        }

        if (!product && id) {
          product = await getProductById(id);
        }

        if (!product) {
          Alert.alert("Error", "Producto no encontrado", [
            { text: "OK", onPress: () => setTimeout(() => router.back(), 100) },
          ]);
          return;
        }

        // Usar negocioId del sessionStore si está disponible — evita un round-trip a Firestore
        const currentNegocioId =
          negocioId ?? (await getNegocioIdByUsuario(user.uid, user.email || ""));

        if (!currentNegocioId) {
          Alert.alert("Error", "No tienes un negocio asignado", [
            { text: "OK", onPress: () => setTimeout(() => router.back(), 100) },
          ]);
          return;
        }

        if (!negocioId) setNegocioId(currentNegocioId);

        // Cargar categorías solo si el store no las tiene (ya cargadas desde la lista de productos)
        if (categories.length === 0) {
          const categoriasData = await getCategoriasByNegocio(currentNegocioId);
          setCategories(categoriasData);
        }

        reset({
          nombre: product.nombre || "",
          categoria_id: product.categoria_id || "",
          precio_venta: product.precio_venta || 0,
          precio_mayoreo: product.precio_mayoreo || 0,
          costo_promedio: product.costo_promedio || 0,
          cantidad: product.cantidad || 0,
          imagen: product.imagen || "",
          descripcion: product.descripcion || "",
          marca: product.marca || "",
          stock_minimo: product.stock_minimo ?? 0,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error al cargar los datos";
        Alert.alert("Error", msg, [
          { text: "OK", onPress: () => setTimeout(() => router.back(), 100) },
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // negocioId y categories se leen del store pero no son deps de init (no deben retriggerar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, productParam, reset, router]);

  const onSubmit = async (data: CreateProductFormData) => {
    if (!id) {
      Alert.alert("Error", "Id del producto no encontrado");
      return;
    }
    if (!negocioId) {
      Alert.alert("Error", "No tienes un negocio asignado");
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio_venta: data.precio_venta,
        precio_mayoreo: data.precio_mayoreo,
        costo_promedio: data.costo_promedio,
        cantidad: data.cantidad,
        imagen: data.imagen?.trim() ? data.imagen : null,
        descripcion: data.descripcion?.trim() ? data.descripcion : null,
        marca: data.marca?.trim() ? data.marca : null,
        stock_minimo: data.stock_minimo != null ? data.stock_minimo : null,
      } as UpdateProductInput;

      await updateProduct(id, updateData);

      const user = auth.currentUser;
      if (user) {
        const storeData = await getProductosScreenData(user.uid, user.email || "");
        setProducts(storeData.products);
      }

      const updatedProduct = await getProductById(id);
      if (updatedProduct) setCurrentProduct(updatedProduct);

      notify.success({ title: "Producto actualizado" });
      router.back();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo actualizar el producto";
      notify.error({ title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    categories,
    loading,
    loadingData,
    submit: handleSubmit(onSubmit),
    goBack: () => router.back(),
  };
}
