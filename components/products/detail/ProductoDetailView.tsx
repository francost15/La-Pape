import ProductImageDisplay from "@/components/products/ProductImageDisplay";
import ProductPriceCard from "@/components/products/ProductPriceCard";
import ProductStockCard from "@/components/products/ProductStockCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ProductoDetailViewProps } from "@/interface/products";
import { useHaptic } from "@/hooks/use-haptic";
import { useResponsive } from "@/hooks/use-responsive";
import { shadow } from "@/lib/utils/shadows";
import { useBottomTabBarHeight } from "expo-router/tabs";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ProductoActions } from "./ProductoActions";
import { ProductoInfo } from "./ProductoInfo";

// A nivel de módulo (no dentro del render) para no recrear el componente en cada
// pintado; lint `react-hooks` lo exige y evita resets de estado.
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
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <IconSymbol name="chevron.left" size={18} color={AppColors.light.textSecondary} />
      <Text
        className="text-xs font-bold tracking-widest text-content-secondary uppercase"
        style={{ fontFamily: AppFonts.bodyStrong }}
      >
        VOLVER
      </Text>
    </Pressable>
  );
}

export function ProductoDetailView({
  product,
  categoria,
  hasImg,
  isCritical,
  deleting,
  onImageError,
  onEdit,
  onDelete,
}: ProductoDetailViewProps) {
  const { isDesktop } = useResponsive();
  const tabBarHeight = useBottomTabBarHeight();

  if (isDesktop) {
    return (
      <ScrollView
        className="flex-1 bg-canvas"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", padding: 48 }}
      >
        <View style={{ width: "100%", maxWidth: 1200 }}>
          <BackButton />
          <View className="mt-0 flex-row items-start gap-16">
            {/* Split Izquierdo: Hero del Producto */}
            <View className="flex-1 gap-8">
              <View
                className="overflow-hidden rounded-[32px] bg-surface-elevated"
                style={{
                  aspectRatio: 1,
                  ...shadow("0 24px 48px rgba(0,0,0,0.06)", 12),
                }}
              >
                <ProductImageDisplay
                  uri={product.imagen}
                  hasImg={hasImg}
                  onError={onImageError}
                  accessibilityLabel={`Imagen de ${product.nombre}`}
                />
              </View>

              {/* QR expandido en desktop editorial */}
              <View className="flex-row items-center gap-4 px-2">
                <View
                  className="rounded-2xl bg-surface-elevated p-3"
                  style={shadow("0 4px 12px rgba(0,0,0,0.04)", 3)}
                >
                  <QRCode value={product.id} size={80} />
                </View>
                <View>
                  <Text className="text-xs font-bold tracking-widest text-content-secondary uppercase">
                    Identifier
                  </Text>
                  <Text className="mt-0.5 font-mono text-sm text-[#6B7280]">
                    {product.id.substring(0, 12)}...
                  </Text>
                </View>
              </View>
            </View>

            {/* Split Derecho: Info & Acciones */}
            <View style={{ width: 480 }} className="gap-8">
              <View>
                <ProductoInfo product={product} categoria={categoria} />
              </View>

              <View className="gap-6">
                <View>
                  <Text
                    className="mb-3 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase"
                    style={{ fontFamily: AppFonts.bodyStrong }}
                  >
                    Valuación Comercial
                  </Text>
                  <ProductPriceCard
                    precioVenta={product.precio_venta}
                    precioMayoreo={product.precio_mayoreo}
                    costoPromedio={product.costo_promedio}
                  />
                </View>

                <View>
                  <Text
                    className="mb-3 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase"
                    style={{ fontFamily: AppFonts.bodyStrong }}
                  >
                    Estado de Inventario
                  </Text>
                  <ProductStockCard
                    cantidad={product.cantidad}
                    stockMinimo={product.stock_minimo}
                    isCritical={isCritical}
                  />
                </View>
              </View>

              <View className="mt-4">
                <ProductoActions deleting={deleting} onEdit={onEdit} onDelete={onDelete} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <View
          className="w-full overflow-hidden rounded-[24px] bg-white dark:bg-neutral-800"
          style={{
            aspectRatio: 1,
            ...shadow("0 12px 24px rgba(0,0,0,0.04)", 8),
          }}
        >
          <ProductImageDisplay
            uri={product.imagen}
            hasImg={hasImg}
            onError={onImageError}
            accessibilityLabel={`Imagen de ${product.nombre}`}
          />
        </View>

        <View className="gap-1 pt-2">
          <ProductoInfo product={product} categoria={categoria} />
        </View>

        <View className="mt-4 gap-6">
          <View>
            <Text className="mb-3 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase">
              COMERCIAL
            </Text>
            <ProductPriceCard
              precioVenta={product.precio_venta}
              precioMayoreo={product.precio_mayoreo}
              costoPromedio={product.costo_promedio}
            />
          </View>

          <View>
            <Text className="mb-3 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase">
              INVENTARIO
            </Text>
            <ProductStockCard
              cantidad={product.cantidad}
              stockMinimo={product.stock_minimo}
              isCritical={isCritical}
            />
          </View>

          <View
            className="items-center rounded-3xl bg-white p-6 dark:bg-neutral-800"
            style={shadow("0 4px 12px rgba(0,0,0,0.04)", 4)}
          >
            <QRCode value={product.id} size={140} />
            <Text className="mt-4 text-[11px] font-medium tracking-tight text-gray-500 uppercase dark:text-gray-400">
              Escaneo de Producto
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="border-t border-gray-100 bg-canvas px-6 py-4 dark:border-neutral-800"
        style={{ paddingBottom: 16 + tabBarHeight }}
      >
        <ProductoActions deleting={deleting} onEdit={onEdit} onDelete={onDelete} />
      </View>
    </View>
  );
}
