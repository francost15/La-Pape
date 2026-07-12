import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AppColors } from "@/constants/colors";
import { auth } from "@/lib/firebase";
import { updateUsuario } from "@/lib/services/usuarios";
import { notify } from "@/lib/notify";
import { useSignOut } from "@/hooks/use-sign-out";
import { resetAllTours } from "@/store/onboarding-store";
import { useSessionStore } from "@/store/session-store";
import { updateProfile } from "firebase/auth";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfigTabPerfil() {
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);
  const displayName = useSessionStore((s) => s.displayName);
  const photoURL = useSessionStore((s) => s.photoURL);
  const usuarioDoc = useSessionStore((s) => s.usuarioDoc);
  const negocioId = useSessionStore((s) => s.negocioId);
  const patchProfile = useSessionStore((s) => s.patchProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSignOut = useSignOut();

  const nombreBase = usuarioDoc?.nombre ?? displayName ?? userEmail?.split("@")[0] ?? "Usuario";

  const handleStartEdit = useCallback(() => {
    setEditNombre(nombreBase);
    setIsEditing(true);
  }, [nombreBase]);

  const handleSave = useCallback(async () => {
    if (!userId || !editNombre.trim()) return;
    setSaving(true);
    try {
      await updateUsuario(userId, { nombre: editNombre.trim() }, userEmail ?? undefined);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: editNombre.trim() });
      }
      patchProfile({ displayName: editNombre.trim() });
      setIsEditing(false);
      Keyboard.dismiss();
      notify.success({ title: "Perfil actualizado" });
    } catch {
      notify.error({ title: "No se pudo actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  }, [userId, userEmail, editNombre, patchProfile]);

  const handleCancelEdit = useCallback(() => {
    setEditNombre(nombreBase);
    setIsEditing(false);
    Keyboard.dismiss();
  }, [nombreBase]);

  const nombre = nombreBase;
  const email = userEmail ?? usuarioDoc?.email ?? "";

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <View className="flex-row items-center gap-4">
          <UserAvatar name={nombre} photoUri={photoURL} size={72} />
          <View className="flex-1">
            {isEditing ? (
              <View className="gap-2">
                <TextInput
                  value={editNombre}
                  onChangeText={setEditNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor={AppColors.light.textMuted}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-base text-gray-900 dark:bg-neutral-700 dark:text-white"
                  autoFocus
                  editable={!saving}
                />
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleSave}
                    disabled={saving || !editNombre.trim()}
                    className="flex-1 items-center rounded-xl bg-orange-600 py-2.5 active:opacity-90"
                    style={!editNombre.trim() ? { opacity: 0.5 } : undefined}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-sm font-semibold text-white">Guardar</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleCancelEdit}
                    disabled={saving}
                    className="flex-1 items-center rounded-xl bg-gray-200 py-2.5 active:opacity-90 dark:bg-neutral-600"
                  >
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">{nombre}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{email}</Text>
                <Pressable
                  onPress={handleStartEdit}
                  className="mt-1 flex-row items-center gap-1.5 self-start active:opacity-80"
                >
                  <IconSymbol name="pencil" size={14} color={AppColors.light.textMuted} />
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Editar perfil
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Apariencia</Text>
          <ThemeToggle />
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="envelope.fill" size={16} color={AppColors.light.textMuted} />
          <Text className="w-20 text-sm text-gray-500 dark:text-gray-400">Email</Text>
          <Text
            className="flex-1 text-right text-sm font-medium text-gray-800 dark:text-gray-200"
            numberOfLines={1}
          >
            {email || "—"}
          </Text>
        </View>
        <View className="mx-4 h-px bg-gray-100 dark:bg-neutral-700" />
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="building.2.fill" size={16} color={AppColors.light.textMuted} />
          <Text className="w-20 text-sm text-gray-500 dark:text-gray-400">Negocio</Text>
          <Text
            className="flex-1 text-right text-sm font-medium text-gray-800 dark:text-gray-200"
            numberOfLines={1}
          >
            {negocioId ? `${negocioId.slice(0, 12)}…` : "Sin negocio"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await resetAllTours();
          notify.success({ title: "Tours reiniciados" });
        }}
        className="border-t border-gray-100 py-3 dark:border-neutral-700"
      >
        <Text className="text-center text-sm text-orange-600 dark:text-orange-400">
          Ver tutorial de nuevo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignOut}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 active:opacity-80 dark:bg-red-900/20"
      >
        <IconSymbol name="arrow.uturn.backward" size={18} color={AppColors.error} />
        <Text className="text-sm font-semibold text-red-600 dark:text-red-400">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
