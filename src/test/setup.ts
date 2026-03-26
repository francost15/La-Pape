// @testing-library/jest-native has compatibility issues - removed temporarily
// import "@testing-library/jest-native";
import { vi } from "vitest";
// import * as asyncStorageMock from "@react-native-async-storage/async-storage/jest/async-storage-mock";

vi.mock("expo-image", () => ({
  Image: "Image",
}));

// vi.mock("@react-native-async-storage/async-storage", () => asyncStorageMock);

vi.mock("react-native-reanimated", () => {
  // Need to use require for reanimated mock - it's a CommonJS module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

vi.mock("react-native-gesture-handler", () => {
  // Need to use require for React Native native modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component: unknown) => component,
    GestureHandlerRootView: View,
  };
});

vi.mock("expo-font", () => ({
  loadAsync: vi.fn(),
  isLoaded: vi.fn(() => true),
}));

vi.mock("expo-constants", () => ({
  default: {
    manifest: {},
    systemFonts: [],
  },
}));

vi.mock("expo-linking", () => ({
  createURL: vi.fn(),
  parse: vi.fn(),
  parseInitialURLAsync: vi.fn(),
}));

vi.mock("expo-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
}));

(global as unknown as { __reanimatedWorkletInit: typeof vi.fn }).__reanimatedWorkletInit = vi.fn();

// Silence console warnings from reanimated during tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("Reanimated")) return;
  originalWarn.apply(console, args);
};
