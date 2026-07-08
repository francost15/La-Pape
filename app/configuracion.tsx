import Navbar from "@/components/navbar";
import ConfigTabEquipo from "@/components/settings/ConfigTabEquipo";
import ConfigTabPerfil from "@/components/settings/ConfigTabPerfil";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { auth } from "@/lib/firebase";
import { useEquipoStore } from "@/store/equipo-store";
import { useLayoutStore } from "@/store/layout-store";
import { useSessionStore } from "@/store/session-store";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
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
              isActive ? "bg-white dark:bg-[#1A1F2B]" : "active:opacity-70"
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
                isActive
                  ? "text-[#1A1A1A] dark:text-[#F0F0F0]"
                  : "text-[#6B7280] dark:text-[#8B95A5]"
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
  const [authUser, setAuthUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        setAuthUser(null);
      } else {
        setAuthUser({
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }
    });
    return unsub;
  }, [router]);

  const negocioId = useSessionStore((s) => s.negocioId);
  const loadMiembros = useEquipoStore((s) => s.loadMiembros);
  const isTablet = useLayoutStore((s) => s.viewportWidth) >= 768;

  const refreshEquipo = useCallback(() => {
    loadMiembros(
      negocioId,
      authUser
        ? {
            userId: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          }
        : undefined
    );
  }, [loadMiembros, negocioId, authUser]);

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
          className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
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
                className="text-sm font-medium text-[#6B7280] dark:text-[#8B95A5]"
                style={{ fontFamily: AppFonts.body }}
              >
                Volver
              </Text>
            </Pressable>

            <View className="mb-2 flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "rgba(234,88,12,0.08)" }}
              >
                <IconSymbol name="gearshape.fill" size={20} color={AppColors.primary} />
              </View>
              <Text
                className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0F0F0]"
                style={{ fontFamily: AppFonts.heading }}
              >
                Configuración
              </Text>
            </View>
            <Text
              className="mb-6 text-sm text-[#6B7280] dark:text-[#8B95A5]"
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
