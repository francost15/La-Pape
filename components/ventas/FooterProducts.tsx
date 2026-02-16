import ProductListContent from "@/components/ventas/ProductListContent";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHEET_HEIGHT_PERCENT = 0.72;
const DISMISS_THRESHOLD = 80;

/**
 * Vista de productos para móvil: FAB "Agregar productos" + sheet modal
 * con búsqueda, categorías y lista de productos.
 */
export default function FooterProducts() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const itemCount = useVentasStore((s) => s.getItemCount());

  const sheetBg = colorScheme === "dark" ? "#171717" : "#f3f4f6";
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{ text: string } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const dragOffsetRef = useRef(0);

  const baseSheetHeight = height * SHEET_HEIGHT_PERCENT;
  const spaceAboveKeyboard = height - insets.top - keyboardHeight;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.min(baseSheetHeight, spaceAboveKeyboard - 24)
      : baseSheetHeight;

  const showProductAddedToast = useCallback((productName: string) => {
    setToastMessage({ text: `${productName} agregado` });
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const closeSheet = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => setSheetVisible(false));
  }, [height, slideAnim]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  const openSheet = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSheetVisible(true);
  }, []);

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
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
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
    })
  ).current;

  return (
    <>
      {!sheetVisible && (
        <Pressable
          onPress={openSheet}
          className="absolute bottom-0 left-0 right-0 z-20 mx-4 mb-6 rounded-2xl bg-orange-500 shadow-lg shadow-orange-900/30 flex-row items-center justify-between px-5 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <IconSymbol name="bag.fill" size={22} color="white" />
            </View>
            <Text className="text-white font-semibold text-base">
              Agregar productos
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {itemCount > 0 && (
              <View className="bg-white rounded-full px-3 py-1">
                <Text className="text-orange-600 font-bold text-sm">
                  {itemCount} en carrito
                </Text>
              </View>
            )}
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
              <IconSymbol name="chevron.up" size={18} color="white" />
            </View>
          </View>
        </Pressable>
      )}

      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: "rgba(0,0,0,0.5)",
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
                ? { boxShadow: "0px -4px 12px 0px rgba(0,0,0,0.15)" }
                : {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
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
                    width: 48,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      colorScheme === "dark" ? "#525252" : "#d1d5db",
                    alignSelf: "center",
                    marginBottom: 12,
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
                      color: colorScheme === "dark" ? "#fafafa" : "#111827",
                    }}
                  >
                    Agregar productos
                  </Text>
                  <TouchableOpacity
                    onPress={closeSheet}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor:
                        colorScheme === "dark" ? "#404040" : "#e5e7eb",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol
                      name="xmark"
                      size={18}
                      color={colorScheme === "dark" ? "#a3a3a3" : "#525252"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1, minHeight: 0, paddingHorizontal: 12 }}>
                <ProductListContent
                  onProductAdded={showProductAddedToast}
                  searchSize="large"
                  listKey="mobile"
                  contentContainerStyle={{
                    paddingBottom: 100 + insets.bottom,
                  }}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </View>

            {toastMessage && (
              <View
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 16 + insets.bottom,
                  zIndex: 9999,
                  backgroundColor: "#ea580c",
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  ...(Platform.OS === "web"
                    ? { boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.25)" }
                    : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 8,
                      }),
                }}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={22}
                  color="white"
                />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 15,
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {toastMessage.text}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
