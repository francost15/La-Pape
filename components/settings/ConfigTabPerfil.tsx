import AppTextInput from "@/components/ui/AppTextInput";
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
import { ActivityIndicator, Keyboard, Pressable, Text, TouchableOpacity, View } from "react-native";

export default function ConfigTabPerfil() {
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);
  const displayName = useSessionStore((s) => s.displayName);
  const photoURL = useSessionStore((s) => s.photoURL);
  const usuarioDoc = useSessionStore((s) => s.usuarioDoc);
  const negocioId = useSessionStore((s) => s.negocioId);
  const negocioNombre = useSessionStore((s) => s.negocioNombre);
  const sucursales = useSessionStore((s) => s.sucursales);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const sucursalNombre = useSessionStore((s) => s.sucursalNombre);
  const setSucursal = useSessionStore((s) => s.setSucursal);
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
    }
    setSaving(false);
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
      <View className="rounded-2xl border border-line bg-surface-elevated p-4">
        <View className="flex-row items-center gap-4">
          <UserAvatar name={nombre} photoUri={photoURL} size={72} />
          <View className="flex-1">
            {isEditing ? (
              <View className="gap-2">
                <AppTextInput
                  value={editNombre}
                  onChangeText={setEditNombre}
                  placeholder="Tu nombre"
                  autoFocus
                  editable={!saving}
                />
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleSave}
                    disabled={saving || !editNombre.trim()}
                    className="flex-1 items-center rounded-xl bg-accent py-2.5 active:opacity-90"
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
                    className="flex-1 items-center rounded-xl bg-surface-hover py-2.5 active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-content-secondary">
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-lg font-bold text-content-primary">{nombre}</Text>
                <Text className="text-sm text-content-secondary">{email}</Text>
                <Pressable
                  onPress={handleStartEdit}
                  className="mt-1 flex-row items-center gap-1.5 self-start active:opacity-80"
                >
                  <IconSymbol name="pencil" size={14} color={AppColors.light.textMuted} />
                  <Text className="text-xs font-medium text-content-secondary">
                    Editar perfil
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-line bg-surface-elevated p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-content-secondary">Apariencia</Text>
          <ThemeToggle />
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-line bg-surface-elevated">
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="envelope.fill" size={16} color={AppColors.light.textMuted} />
          <Text className="w-20 text-sm text-content-secondary">Email</Text>
          <Text
            className="flex-1 text-right text-sm font-medium text-content-primary"
            numberOfLines={1}
          >
            {email || "—"}
          </Text>
        </View>
        <View className="mx-4 h-px bg-surface-hover" />
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="building.2.fill" size={16} color={AppColors.light.textMuted} />
          <Text className="w-20 text-sm text-content-secondary">Negocio</Text>
          <Text
            className="flex-1 text-right text-sm font-medium text-content-primary"
            numberOfLines={1}
          >
            {negocioNombre || (negocioId ? "Negocio sin nombre" : "Sin negocio")}
          </Text>
        </View>
        <View className="mx-4 h-px bg-surface-hover" />
        <View className="gap-3 px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <IconSymbol name="building.2.fill" size={16} color={AppColors.light.textMuted} />
            <Text className="w-20 text-sm text-content-secondary">Sucursal</Text>
            <Text
              className="flex-1 text-right text-sm font-medium text-content-primary"
              numberOfLines={1}
            >
              {sucursalNombre || "Sin sucursal"}
            </Text>
          </View>
          {sucursales.length > 1 ? (
            <View className="flex-row flex-wrap gap-2">
              {sucursales.map((sucursal) => {
                const selected = sucursal.id === sucursalId;
                return (
                  <Pressable
                    key={sucursal.id}
                    onPress={() => setSucursal(sucursal.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={sucursal.nombre}
                    className={`min-h-11 items-center justify-center rounded-xl border px-3 ${
                      selected
                        ? "border-accent bg-accent-soft"
                        : "border-line-strong"
                    }`}
                  >
                    <Text className="text-sm text-content-primary">
                      {sucursal.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await resetAllTours();
          notify.success({ title: "Tours reiniciados" });
        }}
        className="border-t border-line py-3"
      >
        <Text className="text-center text-sm text-accent">
          Ver tutorial de nuevo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignOut}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-error/10 py-4 active:opacity-80"
      >
        <IconSymbol name="arrow.uturn.backward" size={18} color={AppColors.error} />
        <Text className="text-sm font-semibold text-error">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
