import { IconSymbol } from '@/components/ui/icon-symbol';
import { CreateProductFormData } from '@/lib';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Image } from 'expo-image';
import { Alert, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CampoImagenProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
  isWeb?: boolean;
  /** Tamaño fijo del preview en layout tipo detalle (ej. 420x420 desktop) */
  previewSize?: { width: number; height: number };
}

export default function CampoImagen({ control, errors, isWeb = false, previewSize }: CampoImagenProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesita permiso para acceder a la cámara');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesita permiso para acceder a la galería');
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
      Alert.alert('Error', 'No se pudo tomar la foto');
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
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Imagen
      </Text>
      <Controller
        control={control}
        name="imagen"
        render={({ field: { onChange, value } }) => (
          <View>
            {!isWeb && (
              <TouchableOpacity
                className="bg-orange-600 px-4 py-3 rounded-lg mb-3 flex-row items-center justify-center gap-2"
                onPress={() => setShowImageModal(true)}
              >
                <IconSymbol name="camera.fill" size={20} color="white" />
                <Text className="text-white font-semibold">
                  {value ? 'Cambiar Imagen' : 'Tomar Foto o Seleccionar'}
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
                      : { width: '100%', height: 192, borderRadius: 8 }
                  }
                />
                <TouchableOpacity
                  className="mt-2 py-2"
                  onPress={() => onChange('')}
                >
                  <Text className="text-red-600 dark:text-red-400 text-sm font-medium">Quitar imagen</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TextInput
              className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
              placeholder="O ingresa una URL de imagen"
              placeholderTextColor="#9ca3af"
              value={value || ''}
              onChangeText={(text) => onChange(text)}
              keyboardType="url"
              autoCapitalize="none"
            />

            {!isWeb && (
              <Modal
                visible={showImageModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowImageModal(false)}
              >
                <View className="flex-1 bg-black/50 justify-end">
                  <View className="bg-white dark:bg-neutral-800 rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-xl font-bold text-black dark:text-white">
                        Seleccionar Imagen
                      </Text>
                      <TouchableOpacity onPress={() => setShowImageModal(false)}>
                        <Text className="text-orange-600 text-lg font-semibold">Cerrar</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="gap-3">
                      <TouchableOpacity
                        className="bg-orange-600 px-6 py-4 rounded-lg flex-row items-center justify-center gap-3"
                        onPress={() => pickImageFromCamera(onChange)}
                      >
                        <IconSymbol name="camera.fill" size={24} color="white" />
                        <Text className="text-white font-semibold text-lg">Tomar Foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-blue-600 px-6 py-4 rounded-lg flex-row items-center justify-center gap-3"
                        onPress={() => pickImageFromLibrary(onChange)}
                      >
                        <IconSymbol name="photo.fill" size={24} color="white" />
                        <Text className="text-white font-semibold text-lg">
                          Seleccionar de Galería
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        )}
      />
      {errors.imagen && (
        <Text className="text-red-500 text-xs mt-1">{errors.imagen.message}</Text>
      )}
    </View>
  );
}
