import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import type { UserRole } from "@/interface";
import type { MiembroRowProps } from "@/interface/equipo";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from "react-native";
import { RolBadge } from "./RolBadge";
import { ROL_CLASSES, ROL_LABELS, ROLES } from "./roles";

export function MiembroRow({ miembro, currentUserId, onRolChange, onDesactivar }: MiembroRowProps) {
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
    [miembro, onRolChange]
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
    <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-700 dark:bg-neutral-800">
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
          <View className="h-11 w-11 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
              {miembro.inicial}
            </Text>
          </View>
        )}
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {miembro.nombre}
            </Text>
            {isMe && <Text className="text-xs text-gray-400 dark:text-gray-500">(tú)</Text>}
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {miembro.email}
          </Text>
        </View>
        <RolBadge rol={miembro.rol} />
        <IconSymbol
          name={expanded ? "chevron.up" : "chevron.down"}
          size={16}
          color={AppColors.light.textMuted}
        />
      </Pressable>

      {expanded && (
        <View className="gap-3 border-t border-gray-100 px-4 pt-3 pb-4 dark:border-neutral-700">
          <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Cambiar rol
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROLES.map((r) => {
              const isActive = r === miembro.rol;
              const c = ROL_CLASSES[r];
              return (
                <Pressable
                  key={r}
                  onPress={() => handleRol(r)}
                  disabled={loadingRol || isActive}
                  className={`rounded-xl border px-3 py-2 ${
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
              className="flex-row items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 active:opacity-80 dark:bg-red-900/20"
            >
              {loadingDes ? (
                <ActivityIndicator size="small" color={AppColors.error} />
              ) : (
                <IconSymbol name="xmark.circle.fill" size={16} color={AppColors.error} />
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
