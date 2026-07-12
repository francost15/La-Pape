import type { ProductFormFieldProps } from "@/interface/products";
import { useProductosStore } from "@/store/productos-store";
import { type ChangeEvent, createElement, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CampoMarca({ control, errors }: ProductFormFieldProps) {
  const { products } = useProductosStore();
  const [showModal, setShowModal] = useState(false);
  const isWeb = Platform.OS === "web";

  const availableBrands = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.marca?.trim()).filter(Boolean) as string[])
    ).sort();
  }, [products]);

  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Marca</Text>
      <Controller
        control={control}
        name="marca"
        render={({ field: { onChange, value } }) => (
          <View className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            {isWeb ? (
              createElement(
                "select",
                {
                  value: value || "",
                  onChange: (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
                  className:
                    "w-full px-4 py-3 bg-transparent text-black dark:text-white border-none outline-none",
                  style: {
                    width: "100%",
                    padding: "12px 16px",
                  },
                },
                createElement(
                  "option",
                  {
                    value: "",
                    className: "bg-white dark:bg-neutral-800 text-black dark:text-white",
                  },
                  "Selecciona una marca"
                ),
                ...availableBrands.map((brand) =>
                  createElement(
                    "option",
                    {
                      key: brand,
                      value: brand,
                      className: "bg-white dark:bg-neutral-800 text-black dark:text-white",
                    },
                    brand
                  )
                )
              )
            ) : (
              <>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-3"
                  onPress={() => setShowModal(true)}
                >
                  <Text
                    className={
                      value
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  >
                    {value || "Selecciona una marca"}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500">▼</Text>
                </TouchableOpacity>
                <Modal
                  visible={showModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowModal(false)}
                >
                  <View className="flex-1 justify-end bg-black/50">
                    <View className="max-h-[80%] rounded-t-3xl bg-white p-6 dark:bg-neutral-800">
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-black dark:text-white">
                          Seleccionar Marca
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                          <Text className="text-lg font-semibold text-orange-600">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView>
                        {availableBrands.map((brand) => (
                          <TouchableOpacity
                            key={brand}
                            className={`mb-2 rounded-lg p-4 ${
                              value === brand ? "bg-orange-600" : "bg-gray-100 dark:bg-neutral-700"
                            }`}
                            onPress={() => {
                              onChange(brand);
                              setShowModal(false);
                            }}
                          >
                            <Text
                              className={`${
                                value === brand
                                  ? "font-semibold text-white"
                                  : "text-black dark:text-white"
                              }`}
                            >
                              {brand}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        )}
      />
      {errors.marca && <Text className="mt-1 text-xs text-red-500">{errors.marca.message}</Text>}
    </View>
  );
}
