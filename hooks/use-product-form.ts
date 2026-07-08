import { CreateProductFormData, createProductSchema } from "@/lib";
import { getCategoriasByNegocio } from "@/lib/services/categorias";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

export const PRODUCT_FORM_DEFAULTS: CreateProductFormData = {
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
};

interface UseProductFormOptions {
  mode: "create" | "edit";
}

/**
 * Formulario RHF compartido para crear/editar productos.
 * Carga negocio y categorías vía session-store + productos-store.
 */
export function useProductForm({ mode }: UseProductFormOptions) {
  const sessionNegocioId = useSessionStore((s) => s.negocioId);
  const sessionUserId = useSessionStore((s) => s.userId);
  const sessionUserEmail = useSessionStore((s) => s.userEmail);

  const categories = useProductosStore((s) => s.categories);
  const setNegocioId = useProductosStore((s) => s.setNegocioId);
  const setCategories = useProductosStore((s) => s.setCategories);
  const setProductLoading = useProductosStore((s) => s.setProductLoading);

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: PRODUCT_FORM_DEFAULTS,
  });

  const loadEnvironment = useCallback(async () => {
    if (!sessionUserId) return null;

    setProductLoading(true);
    try {
      const negocioId =
        sessionNegocioId ?? (await getNegocioIdByUsuario(sessionUserId, sessionUserEmail || ""));

      if (!negocioId) return null;

      setNegocioId(negocioId);

      if (categories.length === 0) {
        const categoriasData = await getCategoriasByNegocio(negocioId);
        setCategories(categoriasData);
      }

      return negocioId;
    } finally {
      setProductLoading(false);
    }
  }, [
    sessionUserId,
    sessionUserEmail,
    sessionNegocioId,
    categories.length,
    setCategories,
    setNegocioId,
    setProductLoading,
  ]);

  useEffect(() => {
    if (mode === "create") {
      loadEnvironment();
    }
  }, [mode, loadEnvironment]);

  return {
    ...form,
    categories,
    loadEnvironment,
  };
}
