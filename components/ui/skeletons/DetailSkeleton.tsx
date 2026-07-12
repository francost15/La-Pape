import React from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { Bone } from "./Bone";

/** Fila de campo (label + input), como los campos del formulario de edición */
function FieldRowSkeleton() {
  return (
    <View className="gap-2">
      <Bone width={100} height={11} />
      <Bone width="100%" height={48} borderRadius={12} />
    </View>
  );
}

interface DetailSkeletonProps {
  /**
   * "detail" espeja ProductoDetailView (imagen hero + cards de info);
   * "form" espeja EditProductView (imagen + filas de campos).
   */
  variant?: "detail" | "form";
}

/**
 * DetailSkeleton — pantalla completa para detalle/edición de producto.
 * Replica el split desktop (imagen izquierda, columna de 480px derecha) y el
 * stack mobile (imagen cuadrada arriba, secciones abajo) para evitar saltos.
 */
export function DetailSkeleton({ variant = "detail" }: DetailSkeletonProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const rightColumn =
    variant === "form" ? (
      <>
        <FieldRowSkeleton />
        <FieldRowSkeleton />
        <View className="flex-row gap-4">
          <View className="flex-1">
            <FieldRowSkeleton />
          </View>
          <View className="flex-1">
            <FieldRowSkeleton />
          </View>
        </View>
        <FieldRowSkeleton />
        <FieldRowSkeleton />
      </>
    ) : (
      <>
        {/* Título + categoría */}
        <View className="gap-2">
          <Bone width={80} height={11} />
          <Bone width="75%" height={26} />
          <Bone width="40%" height={14} />
        </View>
        {/* Card comercial */}
        <View className="gap-3">
          <Bone width={130} height={10} />
          <Bone width="100%" height={96} borderRadius={16} />
        </View>
        {/* Card inventario */}
        <View className="gap-3">
          <Bone width={130} height={10} />
          <Bone width="100%" height={80} borderRadius={16} />
        </View>
        {/* Acciones */}
        <View className="mt-4 flex-row gap-3">
          <Bone width="48%" height={52} borderRadius={16} />
          <Bone width="48%" height={52} borderRadius={16} />
        </View>
      </>
    );

  if (isDesktop) {
    return (
      <ScrollView
        className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", padding: 48 }}
      >
        <View style={{ width: "100%", maxWidth: 1200 }}>
          {/* Botón volver */}
          <Bone width={90} height={16} className="mb-6" />
          <View className="flex-row items-start gap-16">
            <View className="flex-1">
              <Bone width="100%" borderRadius={32} style={{ aspectRatio: 1 }} />
            </View>
            <View style={{ width: 480 }} className="gap-8">
              {rightColumn}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
    >
      {/* Botón volver */}
      <Bone width={90} height={16} className="mb-2" />
      {/* Imagen hero cuadrada, mismo aspectRatio 1 que la real */}
      <Bone width="100%" borderRadius={24} style={{ aspectRatio: 1 }} />
      <View className="gap-6 pt-2">{rightColumn}</View>
    </ScrollView>
  );
}
