import { IconSymbol } from "@/components/ui/icon-symbol";
import { auth } from "@/lib/firebase";
import { updateUsuario } from "@/lib/services/usuarios";
import { notify } from "@/lib/notify";
import { useSessionStore } from "@/store/session-store";
import { Image } from "expo-image";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
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
  const negocioId = useSessionStore((s) => s.negocioId);
  const [authUser, setAuthUser] = useState<{
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
  } | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setAuthUser({
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          uid: u.uid,
        });
        setEditNombre(u.displayName ?? u.email?.split("@")[0] ?? "");
      } else {
        setAuthUser(null);
      }
    });
    return unsub;
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      notify.error({ title: "Error al cerrar sesión" });
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!authUser?.uid || !editNombre.trim()) return;
    setSaving(true);
    try {
      await updateUsuario(
        authUser.uid,
        { nombre: editNombre.trim() },
        authUser.email ?? undefined
      );
      await updateProfile(auth.currentUser!, { displayName: editNombre.trim() });
      setAuthUser((p) => (p ? { ...p, displayName: editNombre.trim() } : null));
      setIsEditing(false);
      Keyboard.dismiss();
      notify.success({ title: "Perfil actualizado" });
    } catch {
      notify.error({ title: "No se pudo actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  }, [authUser, editNombre]);

  const handleCancelEdit = useCallback(() => {
    setEditNombre(
      authUser?.displayName ?? authUser?.email?.split("@")[0] ?? "Usuario"
    );
    setIsEditing(false);
    Keyboard.dismiss();
  }, [authUser]);

  const nombre =
    authUser?.displayName ?? authUser?.email?.split("@")[0] ?? "Usuario";
  const email = authUser?.email ?? "";
  const inicial = (nombre[0] ?? "?").toUpperCase();

  return (
    <View className="gap-4">
      <View className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-4">
        <View className="flex-row items-center gap-4">
          {authUser?.photoURL && !photoFailed ? (
            <Image
              source={{ uri: authUser.photoURL }}
              style={{ width: 72, height: 72, borderRadius: 36 }}
              contentFit="cover"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <View className="w-[72px] h-[72px] rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
              <Text className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {inicial}
              </Text>
            </View>
          )}
          <View className="flex-1">
            {isEditing ? (
              <View className="gap-2">
                <TextInput
                  value={editNombre}
                  onChangeText={setEditNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-100 dark:bg-neutral-700 rounded-xl px-4 py-2.5 text-base text-gray-900 dark:text-white"
                  autoFocus
                  editable={!saving}
                />
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleSave}
                    disabled={saving || !editNombre.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 items-center active:opacity-90"
                    style={!editNombre.trim() ? { opacity: 0.5 } : undefined}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-sm font-semibold text-white">
                        Guardar
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleCancelEdit}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-neutral-600 items-center active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {nombre}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {email}
                </Text>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="self-start mt-1 flex-row items-center gap-1.5 active:opacity-80"
                >
                  <IconSymbol name="pencil" size={14} color="#9ca3af" />
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Editar perfil
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      <View className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="envelope.fill" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 w-20">Email</Text>
          <Text
            className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 text-right"
            numberOfLines={1}
          >
            {email || "—"}
          </Text>
        </View>
        <View className="h-px bg-gray-100 dark:bg-neutral-700 mx-4" />
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <IconSymbol name="building.2.fill" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 w-20">Negocio</Text>
          <Text
            className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 text-right"
            numberOfLines={1}
          >
            {negocioId ? `${negocioId.slice(0, 12)}…` : "Sin negocio"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 active:opacity-80"
      >
        <IconSymbol name="arrow.uturn.backward" size={18} color="#dc2626" />
        <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
