import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import type { UserRole } from "@/interface";
import type { ConfigTabEquipoProps } from "@/interface/equipo";
import { notify } from "@/lib/notify";
import { useEquipoStore } from "@/store/equipo-store";
import { useSessionStore } from "@/store/session-store";
import { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { CrearUsuarioForm } from "./equipo/CrearUsuarioForm";
import { MiembroRow } from "./equipo/MiembroRow";

export default function ConfigTabEquipo({ onRefresh }: ConfigTabEquipoProps) {
  const negocioId = useSessionStore((s) => s.negocioId);
  const userId = useSessionStore((s) => s.userId);

  const miembros = useEquipoStore((s) => s.miembros);
  const loading = useEquipoStore((s) => s.loading);
  const updateRol = useEquipoStore((s) => s.updateRol);
  const removeMiembro = useEquipoStore((s) => s.removeMiembro);

  const handleRolChange = useCallback(
    async (relId: string, uid: string, email: string | undefined, rol: UserRole) => {
      try {
        await updateRol(relId, uid, email, rol);
        notify.success({ title: "Rol actualizado" });
      } catch {
        notify.error({ title: "No se pudo actualizar el rol" });
      }
    },
    [updateRol]
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
    [removeMiembro]
  );

  return (
    <View className="gap-6">
      {/* Lista de empleados */}
      <View>
        <Text className="mb-3 text-sm font-semibold text-content-secondary">
          Empleados ({miembros.length})
        </Text>
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={AppColors.primary} />
          </View>
        ) : miembros.length === 0 ? (
          <View className="items-center rounded-2xl bg-surface-hover py-12">
            <IconSymbol
              name="person.2.fill"
              size={48}
              color={AppColors.light.textMuted}
              style={{ marginBottom: 8 }}
            />
            <Text className="text-sm text-content-secondary">No hay empleados aún</Text>
            <Text className="mt-1 text-xs text-content-muted">
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
      <CrearUsuarioForm negocioId={negocioId} onCreated={onRefresh} />
    </View>
  );
}
