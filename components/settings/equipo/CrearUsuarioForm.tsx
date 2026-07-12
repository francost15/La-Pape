import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import type { CrearUsuarioFormProps, CrearUsuarioFormState } from "@/interface/equipo";
import { notify } from "@/lib/notify";
import { createUserWithAuthAndLink } from "@/lib/services/usuarios";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ROL_CLASSES, ROL_LABELS, ROLES } from "./roles";

const EMPTY_FORM: CrearUsuarioFormState = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  telefono: "",
  rol: "VENDEDOR",
};

export function CrearUsuarioForm({ negocioId, onCreated }: CrearUsuarioFormProps) {
  const [form, setForm] = useState<CrearUsuarioFormState>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  const set = (k: keyof CrearUsuarioFormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleCrear = useCallback(async () => {
    if (!form.nombre.trim()) {
      notify.error({ title: "El nombre es obligatorio" });
      return;
    }
    if (!form.email.trim()) {
      notify.error({ title: "El email es obligatorio" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      notify.error({ title: "Email inválido" });
      return;
    }
    if (form.password.length < 6) {
      notify.error({ title: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      notify.error({ title: "Las contraseñas no coinciden" });
      return;
    }
    if (!negocioId) {
      notify.error({ title: "No hay negocio asociado" });
      return;
    }
    setCreating(true);
    try {
      await createUserWithAuthAndLink({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim() || undefined,
        rol: form.rol,
        negocioId,
      });
      notify.success({ title: "Usuario creado" });
      setForm(EMPTY_FORM);
      Keyboard.dismiss();
      onCreated?.();
    } catch (e: unknown) {
      const err = e as { code?: string };
      const msg =
        err?.code === "auth/email-already-in-use"
          ? "Ese email ya tiene una cuenta"
          : err?.code === "auth/invalid-email"
            ? "Email inválido"
            : "No se pudo crear el usuario";
      notify.error({ title: msg });
    } finally {
      setCreating(false);
    }
  }, [form, negocioId, onCreated]);

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <Text className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Crear usuario nuevo
      </Text>
      <View className="gap-3">
        <View>
          <Text className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Nombre</Text>
          <TextInput
            value={form.nombre}
            onChangeText={(v) => set("nombre", v)}
            placeholder="María González"
            placeholderTextColor={AppColors.light.textMuted}
            className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:bg-neutral-700/50 dark:text-white"
            style={{ fontSize: 14 }}
          />
        </View>
        <View>
          <Text className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(v) => set("email", v)}
            placeholder="usuario@empresa.com"
            placeholderTextColor={AppColors.light.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:bg-neutral-700/50 dark:text-white"
            style={{ fontSize: 14 }}
          />
        </View>
        <View>
          <Text className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Contraseña (mín. 6)
          </Text>
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 dark:border-neutral-600 dark:bg-neutral-700/50">
            <TextInput
              value={form.password}
              onChangeText={(v) => set("password", v)}
              placeholder="••••••••"
              placeholderTextColor={AppColors.light.textMuted}
              secureTextEntry={!showPass}
              className="flex-1 px-4 py-3 text-sm text-gray-900 dark:text-white"
              style={{ fontSize: 14 }}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} className="p-3">
              <IconSymbol
                name={showPass ? "eye.slash.fill" : "eye.fill"}
                size={18}
                color={AppColors.light.textMuted}
              />
            </Pressable>
          </View>
        </View>
        <View>
          <Text className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Confirmar contraseña
          </Text>
          <TextInput
            value={form.confirmPassword}
            onChangeText={(v) => set("confirmPassword", v)}
            placeholder="••••••••"
            placeholderTextColor={AppColors.light.textMuted}
            secureTextEntry={!showPass}
            className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:bg-neutral-700/50 dark:text-white"
            style={{ fontSize: 14 }}
          />
        </View>
        <View>
          <Text className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Rol</Text>
          <View className="flex-row gap-2">
            {ROLES.map((r) => {
              const isActive = r === form.rol;
              const c = ROL_CLASSES[r];
              return (
                <Pressable
                  key={r}
                  onPress={() => set("rol", r)}
                  className={`flex-1 items-center rounded-xl py-2.5 ${
                    isActive ? `${c.bg} ${c.darkBg}` : "bg-gray-100 dark:bg-neutral-700"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? `${c.text} ${c.darkText}` : "text-gray-500"
                    }`}
                  >
                    {ROL_LABELS[r]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <TouchableOpacity
          onPress={handleCrear}
          disabled={creating}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-600 py-4 active:opacity-90"
          style={creating ? { opacity: 0.7 } : undefined}
        >
          {creating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="person.badge.plus" size={18} color="white" />
          )}
          <Text className="text-sm font-bold text-white">
            {creating ? "Creando…" : "Crear usuario"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
