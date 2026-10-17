import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import type { SelectFieldProps, SelectOption } from "@/interface/ui";
import { type ChangeEvent, createElement, useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { FlatList, Platform, Text, TouchableOpacity, View } from "react-native";

export type { SelectOption };

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
      <Text className="mt-2 mb-2 text-sm font-medium text-content-secondary">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selected = options.find((o) => o.value === value);
          return (
            <View className="overflow-hidden rounded-lg border border-line-strong bg-surface-elevated">
              {isWeb ? (
                createElement(
                  "select",
                  {
                    value: value ?? "",
                    onChange: (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
                    className:
                      "w-full px-4 py-3 bg-transparent text-content-primary border-none outline-none",
                    style: { width: "100%", padding: "12px 16px" },
                  },
                  createElement(
                    "option",
                    {
                      value: "",
                      className: "bg-surface-elevated text-content-primary",
                    },
                    placeholder
                  ),
                  ...options.map((opt) =>
                    createElement(
                      "option",
                      {
                        key: opt.value,
                        value: opt.value,
                        className: "bg-surface-elevated text-content-primary",
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
                    <Text className={selected ? "text-content-primary" : "text-content-muted"}>
                      {selected?.label ?? placeholder}
                    </Text>
                    <Text className="text-content-muted">▼</Text>
                  </TouchableOpacity>
                  <BottomSheetModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    closeLabel={`Cerrar ${label}`}
                  >
                    <View className="px-6 pt-2 pb-6">
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-content-primary">{label}</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                          <Text className="text-lg font-semibold text-accent">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={options}
                        keyExtractor={(opt) => opt.value}
                        style={{ maxHeight: 360 }}
                        renderItem={({ item: opt }) => (
                          <TouchableOpacity
                            className={`mb-2 rounded-lg p-4 ${
                              value === opt.value ? "bg-accent" : "bg-surface-hover"
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
                                  : "text-content-primary"
                              }
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </BottomSheetModal>
                </>
              )}
            </View>
          );
        }}
      />
      {error ? <Text className="mt-1 text-xs text-error">{error}</Text> : null}
    </View>
  );
}
