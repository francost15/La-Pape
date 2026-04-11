import { IconSymbol } from "@/components/ui/icon-symbol";
import ProductListContent from "@/components/ventas/ProductListContent";
import QrScannerSheet from "@/components/ventas/QrScannerSheet";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { AppFonts } from "@/constants/typography";
import { DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import { notify } from "@/lib/notify";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SHEET_HEIGHT_PERCENT = 0.72;
const DISMISS_THRESHOLD = 80;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };

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

  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const closeSheetStore = useVentasUIStore((s) => s.closeSheet);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);

  const baseSheetHeight = height * SHEET_HEIGHT_PERCENT;
  const spaceAboveKeyboard = height - insets.top - keyboardHeight;
  const sheetHeight =
    keyboardHeight > 0 ? Math.min(baseSheetHeight, spaceAboveKeyboard - 24) : baseSheetHeight;

  // ── Animación ─────────────────────────────────────────────────────────
  const translateY = useSharedValue(height);
  const dragOffset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const closeSheet = useCallback(() => {
    haptic();
    translateY.value = withTiming(height, { duration: 250 }, () => {
      runOnJS(closeSheetStore)();
    });
  }, [haptic, height, translateY, closeSheetStore]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  useEffect(() => {
    if (sheetVisible) {
      translateY.value = height;
      translateY.value = withSpring(0, SPRING_CONFIG);
    }
  }, [sheetVisible, height, translateY]);

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

  // ── Gesto de arrastre para cerrar ─────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragOffset.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, dragOffset.value + e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        runOnJS(closeSheetRef.current)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

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
      <View style={{ flex: 1, backgroundColor: backdropBg }}>
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
                      fontWeight: "800",
                      color: colors.textPrimary,
                      letterSpacing: -0.5,
                      fontFamily: AppFonts.heading,
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
                      backgroundColor: isDark ? "#1A1F2B" : "#F5F5F4",
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
                  onQrPress={Platform.OS !== "web" ? () => setQrScannerVisible(true) : undefined}
                  listKey="mobile"
                  contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      <QrScannerSheet
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onProductAdded={showProductAddedToast}
      />
    </View>
  );
}
