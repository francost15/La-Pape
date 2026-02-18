import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToastStore } from '@/store/toast-store';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUS = {
  success: { dot: '#34d399', icon: '\u2713' },
  error: { dot: '#f87171', icon: '\u2717' },
  warning: { dot: '#fbbf24', icon: '!' },
  info: { dot: '#60a5fa', icon: 'i' },
} as const;

const isWeb = Platform.OS === 'web';

function IslandToast({
  type,
  title,
  description,
}: {
  id: string;
  type: keyof typeof STATUS;
  title: string;
  description?: string;
}) {
  const status = STATUS[type];

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(20).stiffness(350)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition.springify()}
      style={[
        styles.island,
        isWeb
          ? { boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)' }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 16,
            },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: status.dot }]}>
        <Text style={styles.dotIcon}>{status.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.desc} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function NativeToaster() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 4 }]}
      pointerEvents="box-none"
    >
      {toasts.map((t) => (
        <IslandToast key={t.id} {...t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    gap: 6,
  },
  island: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 40,
    borderCurve: 'continuous',
    minWidth: 180,
    maxWidth: 340,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIcon: {
    color: '#1c1c1e',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  desc: {
    color: '#a1a1aa',
    fontSize: 11,
  },
});
