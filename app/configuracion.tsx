import Navbar from "@/components/navbar";
import ConfigTabEquipo from "@/components/settings/ConfigTabEquipo";
import ConfigTabPerfil from "@/components/settings/ConfigTabPerfil";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useEquipoStore } from "@/store/equipo-store";
import { useLayoutStore } from "@/store/layout-store";
import { useSessionStore } from "@/store/session-store";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type TabId = "perfil" | "equipo";

const TABS: { id: TabId; label: string }[] = [
  { id: "perfil", label: "Mi Perfil" },
  { id: "equipo", label: "Equipo" },
];

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <View
      className="mb-6 flex-row gap-1 rounded-xl p-1"
      style={{
        backgroundColor: Platform.OS === "web" ? "var(--bg-surface-hover)" : undefined,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              onChange(tab.id);
            }}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${
              isActive ? "bg-surface-elevated" : "active:opacity-70"
            }`}
            style={
              isActive
                ? {
                    ...(Platform.OS === "web"
                      ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
                      : { elevation: 1 }),
                  }
                : undefined
            }
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-content-primary" : "text-content-secondary"
              }`}
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ConfiguracionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("perfil");

  useRequireAuth({ redirectUnauthenticatedTo: "/" });

  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);
  const displayName = useSessionStore((s) => s.displayName);
  const photoURL = useSessionStore((s) => s.photoURL);
  const negocioId = useSessionStore((s) => s.negocioId);
  const loadMiembros = useEquipoStore((s) => s.loadMiembros);
  const isTablet = useLayoutStore((s) => s.viewportWidth) >= 768;

  const refreshEquipo = useCallback(() => {
    loadMiembros(
      negocioId,
      userId
        ? {
            userId,
            email: userEmail,
            displayName,
            photoURL,
          }
        : undefined
    );
  }, [loadMiembros, negocioId, userId, userEmail, displayName, photoURL]);

  useEffect(() => {
    if (activeTab === "equipo") {
      refreshEquipo();
    }
  }, [activeTab, refreshEquipo]);

  return (
    <View className="flex-1">
      <Navbar />
      <AnimatedScreen>
        <ScrollView
          className="flex-1 bg-canvas"
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 40 : 16,
            paddingVertical: isTablet ? 28 : 20,
            paddingBottom: 140,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className={isTablet ? "mx-auto w-full max-w-3xl" : ""}>
            <Pressable
              onPress={() => router.back()}
              className="mb-6 flex-row items-center gap-2 active:opacity-70"
            >
              <IconSymbol name="chevron.left" size={18} color={AppColors.light.textMuted} />
              <Text
                className="text-sm font-medium text-content-secondary"
                style={{ fontFamily: AppFonts.body }}
              >
                Volver
              </Text>
            </Pressable>

            <View className="mb-2 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                <IconSymbol name="gearshape.fill" size={20} color={AppColors.primary} />
              </View>
              <Text
                className="text-2xl font-bold text-content-primary"
                style={{ fontFamily: AppFonts.heading }}
              >
                Configuración
              </Text>
            </View>
            <Text
              className="mb-6 text-sm text-content-secondary"
              style={{ fontFamily: AppFonts.body }}
            >
              Gestiona tu perfil y el equipo del negocio
            </Text>

            <TabBar active={activeTab} onChange={setActiveTab} />

            {activeTab === "perfil" ? (
              <ConfigTabPerfil />
            ) : (
              <ConfigTabEquipo onRefresh={refreshEquipo} />
            )}
          </View>
        </ScrollView>
      </AnimatedScreen>
    </View>
  );
}
