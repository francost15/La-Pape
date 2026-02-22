import { IconSymbol } from "@/components/ui/icon-symbol";
import ProductListContent from "@/components/ventas/ProductListContent";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { notify } from "@/lib/notify";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import * as Haptics from "expo-haptics";
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
 * Sheet "Agregar productos" como overlay (sin Modal) para permitir que las
 * notificaciones dynamic island queden encima y no bloqueen interacción.
 */
export default function AddProductsSheet() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const sheetBg = isDark ? "#1C1C1E" : "#F2F2F7";
  const backdropBg = isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)";
  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const closeSheetStore = useVentasUIStore((s) => s.closeSheet);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
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
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => closeSheetStore());
  }, [height, slideAnim, closeSheetStore]);

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
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
            transform: [{ translateY: slideAnim }],
            ...(Platform.OS === "web"
              ? {
                  boxShadow: isDark
                    ? "0px -4px 20px 0px rgba(0,0,0,0.4)"
                    : "0px -4px 16px 0px rgba(0,0,0,0.12)",
                }
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: isDark ? 0.4 : 0.12,
                  shadowRadius: 16,
                  elevation: 16,
                }),
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                paddingHorizontal: 16,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? "#48484A" : "#C7C7CC",
                  alignSelf: "center",
                  marginBottom: 14,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#F5F5F7" : "#1D1D1F",
                    letterSpacing: -0.3,
                  }}
                >
                  Agregar productos
                </Text>
                <TouchableOpacity
                  onPress={closeSheet}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: isDark ? "#2C2C2E" : "#E8E8ED",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <IconSymbol
                    name="xmark"
                    size={14}
                    color={isDark ? "#8E8E93" : "#6B7280"}
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
    </View>
  );
}
