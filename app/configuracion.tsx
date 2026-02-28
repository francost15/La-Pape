import Navbar from "@/components/navbar";
import ConfigTabEquipo from "@/components/settings/ConfigTabEquipo";
import ConfigTabPerfil from "@/components/settings/ConfigTabPerfil";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
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

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <View className="flex-row gap-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl p-1 mb-6">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              onChange(tab.id);
            }}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${
              isActive
                ? "bg-white dark:bg-neutral-700 shadow-sm"
                : "active:opacity-70"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              }`}
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
    loadMiembros(negocioId, authUser ? {
      userId: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      photoURL: authUser.photoURL,
    } : undefined);
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
          className="flex-1 bg-gray-50 dark:bg-neutral-900"
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 40 : 16,
            paddingVertical: isTablet ? 28 : 20,
            paddingBottom: 140,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className={isTablet ? "max-w-3xl mx-auto w-full" : ""}>
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-2 mb-6 active:opacity-70"
            >
              <IconSymbol name="chevron.left" size={20} color="#6b7280" />
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Volver
              </Text>
            </Pressable>

            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                <IconSymbol name="gearshape.fill" size={20} color="#ea580c" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuración
              </Text>
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
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
