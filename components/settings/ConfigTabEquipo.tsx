import { IconSymbol } from "@/components/ui/icon-symbol";
import type { UserRole } from "@/interface";
import type { MiembroConUsuario } from "@/store/equipo-store";
import { useEquipoStore } from "@/store/equipo-store";
import { useSessionStore } from "@/store/session-store";
import { notify } from "@/lib/notify";
import { createUserWithAuthAndLink } from "@/lib/services/usuarios";
import { Image } from "expo-image";
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

// ─── Role config ───────────────────────────────────────────────────────

const ROLES: UserRole[] = ["ADMIN", "VENDEDOR", "CAJERO"];

const ROL_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  VENDEDOR: "Vendedor",
  CAJERO: "Cajero",
};

const ROL_CLASSES: Record<
  UserRole,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  ADMIN: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    darkBg: "dark:bg-orange-900/30",
    darkText: "dark:text-orange-400",
  },
  VENDEDOR: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    darkBg: "dark:bg-blue-900/30",
    darkText: "dark:text-blue-400",
  },
  CAJERO: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    darkBg: "dark:bg-neutral-700",
    darkText: "dark:text-gray-300",
  },
};

function RolBadge({ rol }: { rol: UserRole }) {
  const c = ROL_CLASSES[rol];
  return (
    <View className={`px-2.5 py-1 rounded-full ${c.bg} ${c.darkBg}`}>
      <Text className={`text-xs font-semibold ${c.text} ${c.darkText}`}>
        {ROL_LABELS[rol]}
      </Text>
    </View>
  );
}

// ─── MiembroRow ────────────────────────────────────────────────────────

function MiembroRow({
  miembro,
  currentUserId,
  onRolChange,
  onDesactivar,
}: {
  miembro: MiembroConUsuario;
  currentUserId: string | null;
  onRolChange: (relId: string, userId: string, email: string | undefined, rol: UserRole) => Promise<void>;
  onDesactivar: (relId: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loadingRol, setLoadingRol] = useState(false);
  const [loadingDes, setLoadingDes] = useState(false);
  const isMe = miembro.relacion.usuario_id === currentUserId;

  const handleRol = useCallback(
    async (r: UserRole) => {
      if (r === miembro.rol) return;
      setLoadingRol(true);
      try {
        await onRolChange(miembro.relacion.id, miembro.relacion.usuario_id, miembro.email, r);
      } finally {
        setLoadingRol(false);
      }
    },
    [miembro, onRolChange],
  );

  const handleDesactivar = useCallback(async () => {
    setLoadingDes(true);
    try {
      await onDesactivar(miembro.relacion.id);
    } finally {
      setLoadingDes(false);
    }
  }, [miembro, onDesactivar]);

  return (
    <View className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
      >
        {miembro.foto ? (
          <Image
            source={{ uri: miembro.foto }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
            <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
              {miembro.inicial}
            </Text>
          </View>
        )}
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {miembro.nombre}
            </Text>
            {isMe && <Text className="text-xs text-gray-400">(tú)</Text>}
          </View>
          <Text
            className="text-xs text-gray-500 dark:text-gray-400"
            numberOfLines={1}
          >
            {miembro.email}
          </Text>
        </View>
        <RolBadge rol={miembro.rol} />
        <IconSymbol
          name={expanded ? "chevron.up" : "chevron.down"}
          size={16}
          color="#9ca3af"
        />
      </Pressable>

      {expanded && (
        <View className="border-t border-gray-100 dark:border-neutral-700 px-4 pt-3 pb-4 gap-3">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cambiar rol
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {ROLES.map((r) => {
              const isActive = r === miembro.rol;
              const c = ROL_CLASSES[r];
              return (
                <Pressable
                  key={r}
                  onPress={() => handleRol(r)}
                  disabled={loadingRol || isActive}
                  className={`px-3 py-2 rounded-xl border ${
                    isActive
                      ? `${c.bg} ${c.darkBg} border-transparent`
                      : "border-gray-200 dark:border-neutral-600"
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
          {!isMe && (
            <TouchableOpacity
              onPress={handleDesactivar}
              disabled={loadingDes}
              className="flex-row items-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-900/20 active:opacity-80"
            >
              {loadingDes ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <IconSymbol name="xmark.circle.fill" size={16} color="#dc2626" />
              )}
              <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                Quitar del negocio
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────

interface FormState {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  rol: UserRole;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  telefono: "",
  rol: "VENDEDOR",
};

interface ConfigTabEquipoProps {
  onRefresh: () => void;
}

export default function ConfigTabEquipo({ onRefresh }: ConfigTabEquipoProps) {
  const negocioId = useSessionStore((s) => s.negocioId);
  const userId = useSessionStore((s) => s.userId);

  const miembros = useEquipoStore((s) => s.miembros);
  const loading = useEquipoStore((s) => s.loading);
  const updateRol = useEquipoStore((s) => s.updateRol);
  const removeMiembro = useEquipoStore((s) => s.removeMiembro);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

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
      onRefresh?.();
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
  }, [form, negocioId, onRefresh]);

  const handleRolChange = useCallback(
    async (relId: string, uid: string, email: string | undefined, rol: UserRole) => {
      try {
        await updateRol(relId, uid, email, rol);
        notify.success({ title: "Rol actualizado" });
      } catch {
        notify.error({ title: "No se pudo actualizar el rol" });
      }
    },
    [updateRol],
  );

  const handleDesactivar = useCallback(
    async (relId: string) => {
      try {
        await removeMiembro(relId);
        notify.success({ title: "Usuario quitado del negocio" });
      } catch {
        notify.error({ title: "No se pudo quitar el usuario" });
      }
    },
    [removeMiembro],
  );

  const set = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <View className="gap-6">
      {/* Lista de empleados */}
      <View>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Empleados ({miembros.length})
        </Text>
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#ea580c" />
          </View>
        ) : miembros.length === 0 ? (
          <View className="py-12 items-center bg-gray-50 dark:bg-neutral-800/60 rounded-2xl">
            <IconSymbol
              name="person.2.fill"
              size={48}
              color="#9ca3af"
              style={{ marginBottom: 8 }}
            />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              No hay empleados aún
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Invita o crea usuarios para añadirlos
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {miembros.map((m) => (
              <MiembroRow
                key={m.relacion.id}
                miembro={m}
                currentUserId={userId}
                onRolChange={handleRolChange}
                onDesactivar={handleDesactivar}
              />
            ))}
          </View>
        )}
      </View>

      {/* Crear usuario nuevo */}
      <View className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 p-4">
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Crear usuario nuevo
        </Text>
        <View className="gap-3">
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Nombre
            </Text>
            <TextInput
              value={form.nombre}
              onChangeText={(v) => set("nombre", v)}
              placeholder="María González"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-neutral-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white"
              style={{ fontSize: 14 }}
            />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => set("email", v)}
              placeholder="usuario@empresa.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 dark:bg-neutral-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white"
              style={{ fontSize: 14 }}
            />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Contraseña (mín. 6)
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-neutral-700/50 rounded-xl border border-gray-200 dark:border-neutral-600">
              <TextInput
                value={form.password}
                onChangeText={(v) => set("password", v)}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPass}
                className="flex-1 px-4 py-3 text-sm text-gray-900 dark:text-white"
                style={{ fontSize: 14 }}
              />
              <Pressable onPress={() => setShowPass((v) => !v)} className="p-3">
                <IconSymbol
                  name={showPass ? "eye.slash.fill" : "eye.fill"}
                  size={18}
                  color="#9ca3af"
                />
              </Pressable>
            </View>
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Confirmar contraseña
            </Text>
            <TextInput
              value={form.confirmPassword}
              onChangeText={(v) => set("confirmPassword", v)}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPass}
              className="bg-gray-50 dark:bg-neutral-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white"
              style={{ fontSize: 14 }}
            />
          </View>
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Rol
            </Text>
            <View className="flex-row gap-2">
              {ROLES.map((r) => {
                const isActive = r === form.rol;
                const c = ROL_CLASSES[r];
                return (
                  <Pressable
                    key={r}
                    onPress={() => set("rol", r)}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      isActive
                        ? `${c.bg} ${c.darkBg}`
                        : "bg-gray-100 dark:bg-neutral-700"
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
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-orange-600 active:opacity-90"
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
    </View>
  );
}
