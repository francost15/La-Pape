import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import type { CampoImagenProps } from "@/interface/products";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Image } from "expo-image";
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CampoImagen({
  control,
  errors,
  isWeb = false,
  previewSize,
}: CampoImagenProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === "web") return true;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos", "Se necesita permiso para acceder a la cámara");
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS === "web") return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos", "Se necesita permiso para acceder a la galería");
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async (onChange: (value: string) => void) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        onChange(uri);
        setShowImageModal(false);
      }
    } catch {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const pickImageFromLibrary = async (onChange: (value: string) => void) => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        onChange(uri);
        setShowImageModal(false);
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-content-secondary">Imagen</Text>
      <Controller
        control={control}
        name="imagen"
        render={({ field: { onChange, value } }) => (
          <View>
            {!isWeb && (
              <TouchableOpacity
                className="mb-3 flex-row items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3"
                onPress={() => setShowImageModal(true)}
              >
                <IconSymbol name="camera.fill" size={20} color="white" />
                <Text className="font-semibold text-white">
                  {value ? "Cambiar Imagen" : "Tomar Foto o Seleccionar"}
                </Text>
              </TouchableOpacity>
            )}

            {value ? (
              <View className="mb-3">
                <Image
                  source={{ uri: value }}
                  contentFit="contain"
                  style={
                    previewSize
                      ? { width: previewSize.width, height: previewSize.height, borderRadius: 8 }
                      : { width: "100%", height: 192, borderRadius: 8 }
                  }
                />
                <TouchableOpacity className="mt-2 py-2" onPress={() => onChange("")}>
                  <Text className="text-sm font-medium text-error">
                    Quitar imagen
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TextInput
              className="rounded-lg border border-line-strong bg-surface-elevated px-4 py-3 text-content-primary"
              placeholder="O ingresa una URL de imagen"
              placeholderTextColor={AppColors.light.textMuted}
              value={value || ""}
              onChangeText={(text) => onChange(text)}
              keyboardType="url"
              autoCapitalize="none"
            />

            {!isWeb && (
              <BottomSheetModal
                visible={showImageModal}
                onClose={() => setShowImageModal(false)}
                closeLabel="Cerrar selector de imagen"
              >
                <View className="px-6 pt-2 pb-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-content-primary">
                      Seleccionar Imagen
                    </Text>
                    <TouchableOpacity onPress={() => setShowImageModal(false)}>
                      <Text className="text-lg font-semibold text-accent">Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="gap-3">
                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-3 rounded-lg bg-accent px-6 py-4"
                      onPress={() => pickImageFromCamera(onChange)}
                    >
                      <IconSymbol name="camera.fill" size={24} color="white" />
                      <Text className="text-lg font-semibold text-white">Tomar Foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-4"
                      onPress={() => pickImageFromLibrary(onChange)}
                    >
                      <IconSymbol name="photo.fill" size={24} color="white" />
                      <Text className="text-lg font-semibold text-white">
                        Seleccionar de Galería
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BottomSheetModal>
            )}
          </View>
        )}
      />
      {errors.imagen && <Text className="mt-1 text-xs text-error">{errors.imagen.message}</Text>}
    </View>
  );
}
