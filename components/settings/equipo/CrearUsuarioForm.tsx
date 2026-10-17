import AppTextInput from "@/components/ui/AppTextInput";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import type { CrearUsuarioFormProps } from "@/interface/equipo";
import { notify } from "@/lib/notify";
import { createUserWithAuthAndLink } from "@/lib/services/usuarios";
import { crearUsuarioSchema, type CrearUsuarioFormData } from "@/lib/validations/usuario-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Keyboard, Pressable, Text, TouchableOpacity, View } from "react-native";
import { ROL_CLASSES, ROL_LABELS, ROLES } from "./roles";

const DEFAULT_VALUES: CrearUsuarioFormData = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  telefono: "",
  rol: "VENDEDOR",
};

export function CrearUsuarioForm({ negocioId, onCreated }: CrearUsuarioFormProps) {
  const [showPass, setShowPass] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrearUsuarioFormData>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = async (data: CrearUsuarioFormData) => {
    if (!negocioId) {
      notify.error({ title: "No hay negocio asociado" });
      return;
    }
    try {
      await createUserWithAuthAndLink({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        nombre: data.nombre.trim(),
        telefono: data.telefono?.trim() || undefined,
        rol: data.rol,
        negocioId,
      });
      notify.success({ title: "Usuario creado" });
      reset(DEFAULT_VALUES);
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
    }
  };

  return (
    <View className="rounded-2xl border border-line bg-surface-elevated p-4">
      <Text className="mb-4 text-sm font-semibold text-content-secondary">
        Crear usuario nuevo
      </Text>
      <View className="gap-3">
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Nombre"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="María González"
              error={errors.nombre?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="usuario@empresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Contraseña (mín. 6)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              error={errors.password?.message}
              style={{ paddingRight: 48 }}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Confirmar contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <Pressable
          onPress={() => setShowPass((v) => !v)}
          className="flex-row items-center gap-1.5 self-start"
          accessibilityRole="button"
          accessibilityLabel={showPass ? "Ocultar contraseñas" : "Mostrar contraseñas"}
        >
          <IconSymbol
            name={showPass ? "eye.slash.fill" : "eye.fill"}
            size={16}
            color={AppColors.light.textMuted}
          />
          <Text className="text-xs font-medium text-content-secondary">
            {showPass ? "Ocultar contraseñas" : "Mostrar contraseñas"}
          </Text>
        </Pressable>

        <View>
          <Text className="mb-2 text-xs font-medium text-content-secondary">Rol</Text>
          <Controller
            control={control}
            name="rol"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                {ROLES.map((r) => {
                  const isActive = r === value;
                  const c = ROL_CLASSES[r];
                  return (
                    <Pressable
                      key={r}
                      onPress={() => onChange(r)}
                      className={`flex-1 items-center rounded-xl py-2.5 ${
                        isActive ? `${c.bg} ${c.darkBg}` : "bg-surface-hover"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isActive ? `${c.text} ${c.darkText}` : "text-content-secondary"
                        }`}
                      >
                        {ROL_LABELS[r]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-accent py-4 active:opacity-90"
          style={isSubmitting ? { opacity: 0.7 } : undefined}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="person.badge.plus" size={18} color="white" />
          )}
          <Text className="text-sm font-bold text-white">
            {isSubmitting ? "Creando…" : "Crear usuario"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
