import { auth, getProductosScreenData } from "@/lib";
import { notify } from "@/lib/notify";
import { deleteProduct, getProductById } from "@/lib/services/productos";
import { useProductosStore } from "@/store/productos-store";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

/**
 * Encapsula la carga del producto (con caché optimista desde params/store) y las
 * acciones de editar/eliminar, para que la pantalla de detalle solo orqueste vistas.
 */
export function useProductoDetail() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const {
    currentProduct: product,
    productLoading: loading,
    productImageError: imageError,
    setCurrentProduct,
    setProductLoading,
    setProductImageError,
    categories,
    setProducts,
  } = useProductosStore();
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let isMounted = true;
      let isLoading = false;

      const loadProduct = async () => {
        if (isLoading) return;
        isLoading = true;
        try {
          setProductImageError(false);
          if (productParam) {
            try {
              const parsed = JSON.parse(productParam);
              if (isMounted && parsed) {
                setCurrentProduct(parsed);
                setProductLoading(false);
                isLoading = false;
                return;
              }
            } catch {
              /* continuar */
            }
          }
          const fromStore = useProductosStore.getState().currentProduct;
          if (fromStore && fromStore.id === id) {
            setProductLoading(false);
            isLoading = false;
            getProductById(id)
              .then((u) => {
                if (isMounted && u) setCurrentProduct(u);
              })
              .catch(console.error);
            return;
          }
          setProductLoading(true);
          const data = await getProductById(id);
          if (isMounted) setCurrentProduct(data ?? null);
        } catch (e) {
          console.error(e);
          if (isMounted) setCurrentProduct(null);
        } finally {
          if (isMounted) setProductLoading(false);
          isLoading = false;
        }
      };

      loadProduct();
      return () => {
        isMounted = false;
      };
    }, [id, productParam, setCurrentProduct, setProductLoading, setProductImageError])
  );

  useEffect(() => {
    if (product?.nombre) navigation.setOptions({ title: product.nombre });
  }, [product?.nombre, navigation]);

  const handleEdit = () => {
    if (product) router.push(`/productos/producto/${product.id}/edit` as any);
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      "Eliminar producto",
      `¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProduct(product.id);
              const user = auth.currentUser;
              if (user) {
                const storeData = await getProductosScreenData(user.uid, user.email || "");
                setProducts(storeData.products);
              }
              setCurrentProduct(null);
              notify.success({ title: `${product.nombre} eliminado` });
              router.replace("/productos" as any);
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : "No se pudo eliminar";
              notify.error({ title: "Error", description: message });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return {
    product,
    loading,
    imageError,
    deleting,
    categories,
    setProductImageError,
    handleEdit,
    handleDelete,
  };
}
