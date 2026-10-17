import { IconSymbol } from "@/components/ui/icon-symbol";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AppColors } from "@/constants/colors";
import type { UserRole } from "@/interface";
import type { MiembroRowProps } from "@/interface/equipo";
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
      } catch (error) {
        setLoadingRol(false);
        throw error;
      }
      setLoadingRol(false);
    },
    [miembro, onRolChange]
  );

  const handleDesactivar = useCallback(async () => {
    setLoadingDes(true);
    try {
      await onDesactivar(miembro.relacion.id);
    } catch (error) {
      setLoadingDes(false);
      throw error;
    }
    setLoadingDes(false);
  }, [miembro, onDesactivar]);

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface-elevated">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-80"
      >
        <UserAvatar name={miembro.nombre} photoUri={miembro.foto} size={44} />
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-sm font-semibold text-content-primary">
              {miembro.nombre}
            </Text>
            {isMe && <Text className="text-xs text-content-muted">(tú)</Text>}
          </View>
          <Text className="text-xs text-content-secondary" numberOfLines={1}>
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
        <View className="gap-3 border-t border-line px-4 pt-3 pb-4">
          <Text className="text-xs font-semibold tracking-wide text-content-secondary">
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
                      : "border-line-strong"
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
          {!isMe && (
            <TouchableOpacity
              onPress={handleDesactivar}
              disabled={loadingDes}
              className="flex-row items-center gap-2 rounded-xl bg-error/10 px-3 py-2.5 active:opacity-80"
            >
              {loadingDes ? (
                <ActivityIndicator size="small" color={AppColors.error} />
              ) : (
                <IconSymbol name="xmark.circle.fill" size={16} color={AppColors.error} />
              )}
              <Text className="text-sm font-semibold text-error">
                Quitar del negocio
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
