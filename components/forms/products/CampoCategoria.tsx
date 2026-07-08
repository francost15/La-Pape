import type { CampoCategoriaProps } from "@/interface/products";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CampoCategoria({
  control,
  errors,
  categories,
  isWeb = false,
}: CampoCategoriaProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Categoría *
      </Text>
      <Controller
        control={control}
        name="categoria_id"
        render={({ field: { onChange, value } }) => (
          <View className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            {isWeb ? (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border-none bg-transparent px-4 py-3 text-black outline-none dark:text-white"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                }}
              >
                <option
                  value=""
                  className="bg-white text-black dark:bg-neutral-800 dark:text-white"
                >
                  Selecciona una categoría
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-white text-black dark:bg-neutral-800 dark:text-white"
                  >
                    {cat.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-3"
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text
                    className={
                      value
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  >
                    {value
                      ? categories.find((c) => c.id === value)?.nombre || "Selecciona una categoría"
                      : "Selecciona una categoría"}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500">▼</Text>
                </TouchableOpacity>
                <Modal
                  visible={showCategoryModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowCategoryModal(false)}
                >
                  <View className="flex-1 justify-end bg-black/50">
                    <View className="max-h-[80%] rounded-t-3xl bg-white p-6 dark:bg-neutral-800">
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-black dark:text-white">
                          Seleccionar Categoría
                        </Text>
                        <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                          <Text className="text-lg font-semibold text-orange-600">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`mb-2 rounded-lg p-4 ${
                              value === cat.id ? "bg-orange-600" : "bg-gray-100 dark:bg-neutral-700"
                            }`}
                            onPress={() => {
                              onChange(cat.id);
                              setShowCategoryModal(false);
                            }}
                          >
                            <Text
                              className={`${
                                value === cat.id
                                  ? "font-semibold text-white"
                                  : "text-black dark:text-white"
                              }`}
                            >
                              {cat.nombre}
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
      {errors.categoria_id && (
        <Text className="mt-1 text-xs text-red-500">{errors.categoria_id.message}</Text>
      )}
    </View>
  );
}
