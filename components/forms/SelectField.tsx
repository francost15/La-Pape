import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { type ChangeEvent, createElement, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder: string;
  error?: string;
}

/**
 * SelectField — picker de formulario unificado (RHF).
 *
 * En web usa un `<select>` nativo; en native abre un [BottomSheetModal] con la
 * lista de opciones. Reemplaza el `<select>` + modal calcado que repetían
 * CampoMarca y CampoCategoria.
 */
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  error,
}: SelectFieldProps<T>) {
  const [showModal, setShowModal] = useState(false);
  const isWeb = Platform.OS === "web";

  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selected = options.find((o) => o.value === value);
          return (
            <View className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
              {isWeb ? (
                createElement(
                  "select",
                  {
                    value: value ?? "",
                    onChange: (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
                    className:
                      "w-full px-4 py-3 bg-transparent text-black dark:text-white border-none outline-none",
                    style: { width: "100%", padding: "12px 16px" },
                  },
                  createElement(
                    "option",
                    {
                      value: "",
                      className: "bg-white dark:bg-neutral-800 text-black dark:text-white",
                    },
                    placeholder
                  ),
                  ...options.map((opt) =>
                    createElement(
                      "option",
                      {
                        key: opt.value,
                        value: opt.value,
                        className: "bg-white dark:bg-neutral-800 text-black dark:text-white",
                      },
                      opt.label
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
                        selected
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    >
                      {selected?.label ?? placeholder}
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500">▼</Text>
                  </TouchableOpacity>
                  <BottomSheetModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    closeLabel={`Cerrar ${label}`}
                  >
                    <View className="px-6 pt-2 pb-6">
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-black dark:text-white">
                          {label}
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                          <Text className="text-lg font-semibold text-orange-600">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView>
                        {options.map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            className={`mb-2 rounded-lg p-4 ${
                              value === opt.value
                                ? "bg-orange-600"
                                : "bg-gray-100 dark:bg-neutral-700"
                            }`}
                            onPress={() => {
                              onChange(opt.value);
                              setShowModal(false);
                            }}
                          >
                            <Text
                              className={
                                value === opt.value
                                  ? "font-semibold text-white"
                                  : "text-black dark:text-white"
                              }
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </BottomSheetModal>
                </>
              )}
            </View>
          );
        }}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
