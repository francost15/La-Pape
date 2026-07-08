import { AppFonts } from "@/constants/typography";
import type { ProductoInfoProps } from "@/interface/products";
import { Text, View } from "react-native";

export function ProductoInfo({ product, categoria }: ProductoInfoProps) {
  return (
    <View>
      <Text
        className="text-3xl tracking-tighter text-[#111827] dark:text-[#F9FAFB]"
        style={{ fontFamily: AppFonts.display, lineHeight: 36 }}
      >
        {product.nombre}
      </Text>
      <View className="mt-2 flex-row flex-wrap items-center gap-2">
        {product.marca ? (
          <Text
            className="text-xs tracking-widest text-[#6B7280] uppercase dark:text-[#8B95A5]"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            {product.marca}
          </Text>
        ) : null}
        {categoria ? (
          <>
            {product.marca ? (
              <View className="h-1 w-1 rounded-full bg-[#D1D5DB] dark:bg-[#4B5563]" />
            ) : null}
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(234, 88, 12, 0.08)" }}
            >
              <Text
                className="text-[10px] font-bold tracking-widest text-[#EA580C] uppercase dark:text-[#FB923C]"
                style={{ fontFamily: AppFonts.bodyStrong }}
              >
                {categoria.nombre}
              </Text>
            </View>
          </>
        ) : null}
      </View>
      {product.descripcion ? (
        <Text
          className="mt-4 text-base leading-6 text-[#6B7280] dark:text-[#A1A1AA]"
          style={{ fontFamily: AppFonts.body }}
        >
          {product.descripcion}
        </Text>
      ) : null}
    </View>
  );
}
