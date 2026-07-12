import type { Product } from "@/interface/products";
import { router } from "expo-router";

/**
 * Navega al detalle de producto. Centraliza el push que antes se repetía en
 * card-products, TopProductsList y ProductosBajoStockList.
 *
 * Se serializa el producto completo en params (JSON.stringify) porque la
 * pantalla de detalle lo usa como estado inicial mientras carga desde Firestore.
 */
export function goToProductDetail(product: Product) {
  router.push({
    pathname: "/productos/producto/[id]" as never,
    params: {
      id: product.id,
      product: JSON.stringify(product),
    },
  });
}
