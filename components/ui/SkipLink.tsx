import { Pressable, Platform, Text } from "react-native";

export function SkipLink({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  const handlePress = () => {
    if (Platform.OS === "web") {
      const element = document.getElementById(targetId);
      element?.focus();
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-orange-500 focus:px-4 focus:py-2"
    >
      <Text className="text-white font-semibold text-sm">{children}</Text>
    </Pressable>
  );
}

