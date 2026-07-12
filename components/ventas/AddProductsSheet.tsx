import { IconSymbol } from "@/components/ui/icon-symbol";
import ProductListContent from "@/components/ventas/ProductListContent";
import QrScannerSheet from "@/components/ventas/QrScannerSheet";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import { notify } from "@/lib/notify";
import {
  animateSheetClose,
  animateSheetOpen,
  createSheetPanGesture,
} from "@/lib/animations/add-products-sheet";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";

const SHEET_HEIGHT_PERCENT = 0.72;

/**
 * AddProductsSheet — Digital Atelier style.
 *
 * Sheet de búsqueda de productos para mobile.
 * Usa Reanimated + GestureDetector (cumple la convención del proyecto).
 */
export default function AddProductsSheet() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useThemeColors();
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();

  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const closeSheetStore = useVentasUIStore((s) => s.closeSheet);
  const qrScannerVisible = useVentasUIStore((s) => s.qrScannerVisible);
  const openQrScanner = useVentasUIStore((s) => s.openQrScanner);
  const closeQrScanner = useVentasUIStore((s) => s.closeQrScanner);
  // keyboardHeight es una medición efímera de eventos del teclado (no estado
  // compartido), por eso se mantiene local.
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const baseSheetHeight = height * SHEET_HEIGHT_PERCENT;
  const spaceAboveKeyboard = height - insets.top - keyboardHeight;
  const sheetHeight =
    keyboardHeight > 0 ? Math.min(baseSheetHeight, spaceAboveKeyboard - 24) : baseSheetHeight;

  // ── Animación ─────────────────────────────────────────────────────────
  const translateY = useSharedValue(height);
  const dragOffset = useSharedValue(0);
  // El backdrop hace fade sincronizado con el sheet (opacidad = permitida
  // incluso bajo reduced motion, ayuda a entender la aparición del overlay).
  const backdropOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const closeSheet = useCallback(() => {
    haptic();
    animateSheetClose(translateY, backdropOpacity, height, closeSheetStore);
  }, [haptic, height, closeSheetStore, translateY, backdropOpacity]);

  useEffect(() => {
    if (sheetVisible) {
      animateSheetOpen(translateY, backdropOpacity, height, reduceMotion);
    }
  }, [sheetVisible, height, reduceMotion, translateY, backdropOpacity]);

  // ── Teclado ───────────────────────────────────────────────────────────
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const panGesture = useMemo(
    () => createSheetPanGesture(translateY, dragOffset, closeSheet),
    [closeSheet, translateY, dragOffset]
  );

  const showProductAddedToast = useCallback(
    (productName: string) => notify.success({ title: `${productName} agregado` }),
    []
  );

  if (!sheetVisible || width >= DESKTOP_MIN_WIDTH) return null;

  const backdropBg = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.45)";

  return (
    <View
      style={[StyleSheet.absoluteFill, { paddingTop: insets.top, zIndex: 9000 }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[{ flex: 1, backgroundColor: backdropBg }, backdropStyle]}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            Keyboard.dismiss();
            closeSheet();
          }}
        />

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: sheetHeight,
                backgroundColor: colors.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                overflow: "hidden",
                ...(Platform.OS === "web"
                  ? {
                      boxShadow: isDark
                        ? "0px -4px 32px 0px rgba(0,0,0,0.6)"
                        : "0px -4px 32px 0px rgba(0,0,0,0.14)",
                    }
                  : {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: -6 },
                      shadowOpacity: isDark ? 0.6 : 0.14,
                      shadowRadius: 24,
                      elevation: 20,
                    }),
              },
              animatedStyle,
            ]}
          >
            <View style={{ flex: 1 }}>
              {/* ── Header ────────────────────────────────────────── */}
              <View
                style={{
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                {/* Handle */}
                <View
                  style={{
                    width: 40,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: isDark ? "#2C3440" : "#E5E5EA",
                    alignSelf: "center",
                    marginBottom: 16,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: colors.textPrimary,
                      letterSpacing: -0.5,
                      fontFamily: AppFonts.heading,
                      // En native el peso va codificado en el archivo de fuente; un
                      // fontWeight explícito fuerza bold sintético. En web sí se declara.
                      ...(Platform.OS === "web" ? { fontWeight: "800" as const } : null),
                    }}
                  >
                    Agregar productos
                  </Text>
                  <TouchableOpacity
                    onPress={closeSheet}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isDark
                        ? AppColors.dark.surfaceElevated
                        : AppColors.light.surfaceHover,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel="Cerrar"
                  >
                    <IconSymbol name="xmark" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Lista de productos ─────────────────────────── */}
              <View style={{ flex: 1, minHeight: 0 }}>
                <ProductListContent
                  searchContextId="ventas"
                  onProductAdded={showProductAddedToast}
                  searchSize="large"
                  showQrButton
                  onQrPress={Platform.OS !== "web" ? openQrScanner : undefined}
                  listKey="mobile"
                  contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>

      <QrScannerSheet
        visible={qrScannerVisible}
        onClose={closeQrScanner}
        onProductAdded={showProductAddedToast}
      />
    </View>
  );
}
