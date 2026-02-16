import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, Pressable, TextInput, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface SearchProductsProps {
  searchText: string;
  onSearchChange: (searchText: string) => void;
  /** Usar en modales/sheets para mejor visibilidad en mobile */
  size?: 'default' | 'large';
}

const colors = {
  light: {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    placeholder: '#9ca3af',
  },
  dark: {
    bg: '#262626',
    border: '#404040',
    text: '#fafafa',
    placeholder: '#a3a3a3',
  },
};

export default function SearchProducts({ searchText, onSearchChange, size = 'default' }: SearchProductsProps) {
    const isWeb = Platform.OS === 'web';
    const colorScheme = useColorScheme();
    const theme = colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const iconSize = size === 'large' ? 22 : isWeb ? 22 : 20;
    const paddingVertical = size === 'large' ? 14 : isWeb ? 12 : 10;
    const hasText = searchText.trim().length > 0;

    return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.bg,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical,
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
            width: '100%',
            alignSelf: 'stretch',
          }}
        >
          <IconSymbol name="magnifyingglass" size={iconSize} color={theme.placeholder} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.text,
              paddingVertical: 8,
              paddingHorizontal: 0,
              minHeight: 40,
            }}
            placeholder="Buscar por nombre, marca o categoría..."
            placeholderTextColor={theme.placeholder}
            value={searchText}
            onChangeText={onSearchChange}
          />
          {hasText && (
            <Pressable
              onPress={() => onSearchChange('')}
              style={{ padding: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Limpiar búsqueda"
            >
              <IconSymbol name="xmark" size={20} color={theme.placeholder} />
            </Pressable>
          )}
        </View>
    )
}