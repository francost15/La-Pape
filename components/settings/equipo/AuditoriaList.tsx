import { formatDate, formatTime } from "@/lib/utils/format";
import { getAuditoria } from "@/lib/services/auditoria";
import type { AuditEntry } from "@/interface/auditoria";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export function AuditoriaList({ negocioId }: { negocioId: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    let active = true;
    getAuditoria(negocioId)
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .catch(() => {
        if (active) setEntries([]);
      });
    return () => {
      active = false;
    };
  }, [negocioId]);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-content-secondary">Actividad reciente</Text>
      {entries.length === 0 ? (
        <Text className="text-sm text-content-muted">Sin movimientos registrados</Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} className="rounded-xl bg-surface-elevated px-4 py-3">
            <Text className="text-sm text-content-primary">
              {entry.accion} · {entry.entidad}
            </Text>
            <Text className="text-xs text-content-muted">
              {entry.createdAt
                ? `${formatDate(entry.createdAt)} ${formatTime(entry.createdAt)}`
                : entry.entidad_id}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
