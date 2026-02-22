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
  index,
}: {
  id: string;
  type: keyof typeof STATUS;
  title: string;
  description?: string;
  index: number;
}) {
  const status = STATUS[type];

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeInDown.springify()
        .damping(20)
        .stiffness(350)
        .delay(index * 60)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition.springify().damping(18).stiffness(120)}
      style={[
        styles.island,
        isWeb
          ? { boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.35)' }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.45,
              shadowRadius: 28,
              elevation: 20,
            },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: status.dot }]}>
        <Text style={styles.dotIcon}>{status.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.desc} numberOfLines={2}>
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
      style={[StyleSheet.absoluteFill, styles.overlay]}
      pointerEvents="box-none"
    >
      <View
        style={[styles.container, { top: insets.top + 12 }]}
        pointerEvents="none"
      >
        {[...toasts].reverse().map((t, index) => (
          <IslandToast key={t.id} {...t} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'transparent',
    zIndex: 99999,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  island: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 48,
    borderCurve: 'continuous',
    minWidth: 260,
    maxWidth: 420,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIcon: {
    color: '#1c1c1e',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  desc: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },
});
