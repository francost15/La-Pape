import { IconSymbol } from "@/components/ui/icon-symbol";
import ProductListContent from "@/components/ventas/ProductListContent";
import QrScannerSheet from "@/components/ventas/QrScannerSheet";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { notify } from "@/lib/notify";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHEET_HEIGHT_PERCENT = 0.72;
const DISMISS_THRESHOLD = 80;
const MOBILE_MAX_WIDTH = 768;

/**
 * AddProductsSheet — Digital Atelier style.
 *
 * Immersive bottom sheet for mobile.
 * Navy dark mode (#0C0F14), stone light mode (#FAFAF9).
 * Premium handles and borders.
 */
export default function AddProductsSheet() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const haptic = useHaptic();
  
  const colors = isDark ? AppColors.dark : AppColors.light;
  const sheetBg = colors.surface;
  const backdropBg = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.45)";
  
  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const closeSheetStore = useVentasUIStore((s) => s.closeSheet);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [qrScannerVisible, setQrScannerVisible] = React.useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const dragOffsetRef = useRef(0);

  const baseSheetHeight = height * SHEET_HEIGHT_PERCENT;
  const spaceAboveKeyboard = height - insets.top - keyboardHeight;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.min(baseSheetHeight, spaceAboveKeyboard - 24)
      : baseSheetHeight;

  const showProductAddedToast = useCallback(
    (productName: string) =>
      notify.success({ title: `${productName} agregado` }),
    [],
  );

  const closeSheet = useCallback(() => {
    haptic();
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => closeSheetStore());
  }, [haptic, height, slideAnim, closeSheetStore]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  useEffect(() => {
    if (sheetVisible) {
      slideAnim.setValue(height);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 12,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [sheetVisible, slideAnim, height]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderGrant: () => {
        slideAnim.stopAnimation((v) => {
          dragOffsetRef.current = v;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(0, dragOffsetRef.current + gestureState.dy);
        slideAnim.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          closeSheetRef.current();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 12,
            useNativeDriver: Platform.OS !== "web",
          }).start();
        }
      },
    }),
  ).current;

  if (!sheetVisible || width >= MOBILE_MAX_WIDTH) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { paddingTop: insets.top, zIndex: 9000 }]}
      pointerEvents="box-none"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: backdropBg,
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            Keyboard.dismiss();
            closeSheet();
          }}
        />
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: sheetHeight,
            backgroundColor: sheetBg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
            transform: [{ translateY: slideAnim }],
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
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
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
                >
                  <IconSymbol
                    name="xmark"
                    size={14}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, minHeight: 0 }}>
              <ProductListContent
                searchContextId="ventas"
                onProductAdded={showProductAddedToast}
                searchSize="large"
                showQrButton
                onQrPress={
                  Platform.OS !== "web"
                    ? () => setQrScannerVisible(true)
                    : undefined
                }
                listKey="mobile"
                contentContainerStyle={{
                  paddingBottom: 100 + insets.bottom,
                }}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </View>
        </Animated.View>
      </View>
      <QrScannerSheet
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onProductAdded={showProductAddedToast}
      />
    </View>
  );
}
